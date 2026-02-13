import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../core/token.service';

@Component({
  selector: 'app-entrar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrar.component.html',
  styleUrl: './entrar.component.scss',
})
export class EntrarComponent {
  codigo = '';
  erro: string | null = null;

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  get returnUrl(): string {
    const url = this.route.snapshot.queryParams['returnUrl'];
    return url ? `/${url}` : '/';
  }

  enviar(): void {
    this.erro = null;
    const t = this.codigo.trim();
    if (!t) {
      this.erro = 'Digite o código do seu convite.';
      return;
    }
    if (!this.tokenService.isValid(t)) {
      this.erro = 'Código inválido. Use o link que enviamos no seu convite.';
      return;
    }
    this.tokenService.setToken(t);
    this.router.navigateByUrl(this.returnUrl);
  }
}
