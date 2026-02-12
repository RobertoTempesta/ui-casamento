import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PresentesService } from '../../services/presentes.service';
import { Presente } from '../../models/presente.model';

@Component({
  selector: 'app-admin-presentes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-presentes.component.html',
  styleUrl: './admin-presentes.component.scss',
})
export class AdminPresentesComponent implements OnInit {
  presentes: Presente[] = [];
  carregando = true;
  erro: string | null = null;
  salvando = false;
  excluindoId: string | null = null;

  novoPresente = {
    nome: '',
    descricao: '',
    valor: null as number | null | string,
  };

  constructor(private presentesService: PresentesService) {}

  ngOnInit(): void {
    this.carregar();
  }

  async carregar(): Promise<void> {
    this.carregando = true;
    this.erro = null;
    try {
      this.presentes = await this.presentesService.listar();
    } catch (e) {
      this.erro = 'Erro ao carregar. Verifique a configuração do Firebase.';
      console.error(e);
    } finally {
      this.carregando = false;
    }
  }

  async cadastrar(): Promise<void> {
    const nome = String(this.novoPresente.nome ?? '').trim();
    if (!nome) return;

    this.salvando = true;
    this.erro = null;
    try {
      const valor = this.coerceValor(this.novoPresente.valor);
      await this.presentesService.cadastrar({
        nome,
        descricao: String(this.novoPresente.descricao ?? '').trim() || undefined,
        valor,
      });
      this.novoPresente = { nome: '', descricao: '', valor: null };
      await this.carregar();
    } catch (e) {
      this.erro = e instanceof Error ? e.message : 'Erro ao cadastrar. Verifique se o Firebase está rodando (emulador ou projeto).';
      console.error(e);
    } finally {
      this.salvando = false;
    }
  }

  /** Converte valor do formulário (pode vir como string do input number) para number ou undefined. */
  private coerceValor(val: number | null | string | undefined): number | undefined {
    if (val === null || val === undefined || val === '') return undefined;
    const n = Number(val);
    return isNaN(n) || n < 0 ? undefined : n;
  }

  async cancelarReserva(p: Presente): Promise<void> {
    if (!p.reservado) return;
    if (!confirm('Cancelar reserva deste presente?')) return;
    try {
      await this.presentesService.cancelarReserva(p.id);
      await this.carregar();
    } catch (e) {
      this.erro = e instanceof Error ? e.message : 'Erro ao cancelar.';
    }
  }

  async excluir(p: Presente): Promise<void> {
    if (!confirm('Excluir este presente da lista?')) return;
    this.excluindoId = p.id;
    try {
      await this.presentesService.excluir(p.id);
      await this.carregar();
    } catch (e) {
      this.erro = e instanceof Error ? e.message : 'Erro ao excluir.';
    } finally {
      this.excluindoId = null;
    }
  }

  formatarValor(valor?: number): string {
    if (valor == null) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  }
}
