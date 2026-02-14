import { Component, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PresentesService } from '../../services/presentes.service';
import { Presente } from '../../models/presente.model';

@Component({
  selector: 'app-presentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './presentes.component.html',
  styleUrl: './presentes.component.scss',
})
export class PresentesComponent implements OnInit {
  presentes: Presente[] = [];
  carregando = true;
  erro: string | null = null;
  reservandoId: string | null = null;
  modalReserva = false;
  presenteSelecionado: Presente | null = null;
  nomeReserva = '';
  /** Honeypot: se preenchido, ignora o envio (bot). */
  hpWebsite = '';
  /** Mensagem de erro específica do modal (ex.: limite de reservas). */
  erroReserva: string | null = null;

  /** Máximo de reservas por nome (evita uma pessoa reservar tudo). */
  private static readonly MAX_RESERVAS_POR_NOME = 3;
  /** Intervalo mínimo entre reservas (ms) para o mesmo navegador. */
  private static readonly COOLDOWN_MS = 60_000;

  constructor(
    private presentesService: PresentesService,
    private cdr: ChangeDetectorRef
  ) {}

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.modalReserva) this.fecharModal();
  }

  ngOnInit(): void {
    this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando = true;
    this.erro = null;
    try {
      this.presentes = await this.presentesService.listar();
    } catch (e) {
      this.erro = 'Não foi possível carregar a lista. Verifique se o Firebase está configurado.';
      console.error(e);
    } finally {
      this.carregando = false;
    }
  }

  async abrirModalReserva(presente: Presente): Promise<void> {
    if (presente.reservado) return;
    try {
      const atual = await this.presentesService.obterPorId(presente.id);
      if (!atual) {
        this.erro = 'Presente não encontrado.';
        await this.carregar();
        return;
      }
      if (atual.reservado) {
        this.erro = 'Este presente já foi reservado por outra pessoa. Lista atualizada.';
        await this.carregar();
        this.cdr.detectChanges();
        return;
      }
      this.presenteSelecionado = atual;
      this.nomeReserva = '';
      this.hpWebsite = '';
      this.erroReserva = null;
      this.modalReserva = true;
    } catch {
      this.erro = 'Não foi possível verificar o presente. Tente novamente.';
    }
    this.cdr.detectChanges();
  }

  fecharModal(): void {
    this.modalReserva = false;
    this.presenteSelecionado = null;
    this.nomeReserva = '';
    this.hpWebsite = '';
    this.erroReserva = null;
  }

  async reservar(): Promise<void> {
    if (!this.presenteSelecionado || !this.nomeReserva.trim()) return;

    // Honeypot: se preenchido, provável bot — não envia e não avisa
    if (this.hpWebsite?.trim()) return;

    const nome = this.nomeReserva.trim();

    // Cooldown: evita muitos cliques em sequência no mesmo navegador
    const lastKey = 'presentes_last_reserva';
    const last = sessionStorage.getItem(lastKey);
    if (last) {
      const elapsed = Date.now() - Number(last);
      if (elapsed < PresentesComponent.COOLDOWN_MS) {
        this.erroReserva = `Aguarde ${Math.ceil((PresentesComponent.COOLDOWN_MS - elapsed) / 1000)} segundos para uma nova reserva.`;
        return;
      }
    }

    // Limite de reservas por nome (reduz abuso de uma pessoa reservar tudo)
    const jaReservados = this.presentes.filter(
      (p) => p.reservado && p.reservadoPor?.toLowerCase() === nome.toLowerCase()
    );
    if (jaReservados.length >= PresentesComponent.MAX_RESERVAS_POR_NOME) {
      this.erroReserva = `Cada pessoa pode reservar no máximo ${PresentesComponent.MAX_RESERVAS_POR_NOME} presentes. Você já reservou ${jaReservados.length}.`;
      return;
    }

    // Consultar no banco se ainda não foi reservado antes de enviar
    try {
      const atual = await this.presentesService.obterPorId(this.presenteSelecionado.id);
      if (!atual) {
        this.erroReserva = 'Presente não encontrado. Atualize a página.';
        return;
      }
      if (atual.reservado) {
        this.erroReserva = 'Este presente já foi reservado por outra pessoa.';
        await this.carregar();
        this.cdr.detectChanges();
        return;
      }
    } catch {
      this.erroReserva = 'Não foi possível verificar. Tente novamente.';
      return;
    }

    this.reservandoId = this.presenteSelecionado.id;
    this.erro = null;
    this.erroReserva = null;
    try {
      await this.presentesService.reservar(this.presenteSelecionado.id, nome);
      sessionStorage.setItem(lastKey, String(Date.now()));
      this.fecharModal();
      await this.carregar();
    } catch (e) {
      this.erro =
        e instanceof Error ? e.message : 'Erro ao reservar. Tente novamente.';
    } finally {
      this.reservandoId = null;
    }
  }

  formatarValor(valor?: number): string {
    if (valor == null) return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }
}
