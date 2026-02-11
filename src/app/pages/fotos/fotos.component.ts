import { Component } from '@angular/core';

@Component({
  selector: 'app-fotos',
  standalone: true,
  templateUrl: './fotos.component.html',
  styleUrl: './fotos.component.scss',
})
export class FotosComponent {
  // Placeholder para galeria. Em produção, carregar de Firebase/Supabase Storage
  fotos: { src: string; alt: string }[] = [
    { src: 'https://placehold.co/600x400/f5f3ef/b8860b?text=Foto+1', alt: 'Foto 1' },
    { src: 'https://placehold.co/600x400/f5f3ef/b8860b?text=Foto+2', alt: 'Foto 2' },
    { src: 'https://placehold.co/600x400/f5f3ef/b8860b?text=Foto+3', alt: 'Foto 3' },
  ];
}
