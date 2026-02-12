import { Component, HostListener, OnInit } from '@angular/core';
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

  constructor(private presentesService: PresentesService) {}

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

  abrirModalReserva(presente: Presente): void {
    if (presente.reservado) return;
    this.presenteSelecionado = presente;
    this.nomeReserva = '';
    this.modalReserva = true;
  }

  fecharModal(): void {
    this.modalReserva = false;
    this.presenteSelecionado = null;
    this.nomeReserva = '';
  }

  async reservar(): Promise<void> {
    if (!this.presenteSelecionado || !this.nomeReserva.trim()) return;
    this.reservandoId = this.presenteSelecionado.id;
    this.erro = null;
    try {
      await this.presentesService.reservar(
        this.presenteSelecionado.id,
        this.nomeReserva.trim()
      );
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
