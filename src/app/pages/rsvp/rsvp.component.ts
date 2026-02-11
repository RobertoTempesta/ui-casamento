import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-rsvp',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './rsvp.component.html',
  styleUrl: './rsvp.component.scss',
})
export class RsvpComponent {
  form: FormGroup;
  enviado = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      confirmacao: ['sim', Validators.required],
      acompanhantes: [0],
      mensagem: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // MVP: simular envio. Em produção, enviar para Firebase/Supabase ou Google Forms
    console.log('RSVP:', this.form.value);
    this.enviado = true;
  }

  novaConfirmacao(): void {
    this.enviado = false;
    this.form.reset({ confirmacao: 'sim', acompanhantes: 0 });
  }
}
