import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface FotoIgreja {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-cerimonia',
  standalone: true,
  templateUrl: './cerimonia.component.html',
  styleUrl: './cerimonia.component.scss',
})
export class CerimoniaComponent implements OnInit, OnDestroy {
  /** Google Maps embed - Paróquia São José, Santa Cruz do Rio Pardo, zoom 17 */
  readonly mapSrc: SafeResourceUrl;

  /** Fotos da igreja para o carrossel (arquivos em src/assets/fotos). */
  readonly fotosIgreja: FotoIgreja[] = [
    { src: 'assets/fotos/saojose1.jpg', alt: 'Paróquia São José - vista 1' },
    { src: 'assets/fotos/saojose2.jpg', alt: 'Paróquia São José - vista 2' },
    { src: 'assets/fotos/saojose3.jpg', alt: 'Paróquia São José - vista 3' },
    { src: 'assets/fotos/saojose4.jpg', alt: 'Paróquia São José - vista 4' },
    { src: 'assets/fotos/saojose5.jpg', alt: 'Paróquia São José - vista 5' },
    { src: 'assets/fotos/saojose6.jpg', alt: 'Paróquia São José - vista 6' },
    { src: 'assets/fotos/saojose7.jpg', alt: 'Paróquia São José - vista 7' },
    { src: 'assets/fotos/saojose8.jpg', alt: 'Paróquia São José - vista 8' },
  ];

  fotoAtualIndex = 0;
  lightboxAberta = false;
  fotoLightboxIndex = 0;
  private autoplayInterval: ReturnType<typeof setInterval> | null = null;

  constructor(sanitizer: DomSanitizer) {
    const mapUrl = 'https://maps.google.com/maps?q=-22.9104048,-49.6343965&z=17&t=s&output=embed';
    this.mapSrc = sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  ngOnInit(): void {
    this.iniciarAutoplay();
  }

  ngOnDestroy(): void {
    this.pararAutoplay();
  }

  get totalFotos(): number {
    return this.fotosIgreja.length;
  }

  fotoAnterior(): void {
    this.fotoAtualIndex = this.fotoAtualIndex <= 0 ? this.totalFotos - 1 : this.fotoAtualIndex - 1;
    this.reiniciarAutoplay();
  }

  proximaFoto(): void {
    this.fotoAtualIndex = this.fotoAtualIndex >= this.totalFotos - 1 ? 0 : this.fotoAtualIndex + 1;
    this.reiniciarAutoplay();
  }

  irParaFoto(index: number): void {
    this.fotoAtualIndex = index;
    this.reiniciarAutoplay();
  }

  abrirLightbox(index: number): void {
    this.fotoLightboxIndex = index;
    this.lightboxAberta = true;
  }

  fecharLightbox(): void {
    this.lightboxAberta = false;
  }

  lightboxAnterior(): void {
    this.fotoLightboxIndex = this.fotoLightboxIndex <= 0 ? this.totalFotos - 1 : this.fotoLightboxIndex - 1;
  }

  lightboxProxima(): void {
    this.fotoLightboxIndex = this.fotoLightboxIndex >= this.totalFotos - 1 ? 0 : this.fotoLightboxIndex + 1;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.lightboxAberta) this.fecharLightbox();
  }

  private iniciarAutoplay(): void {
    if (this.totalFotos <= 1) return;
    this.autoplayInterval = setInterval(() => this.proximaFoto(), 5000);
  }

  private pararAutoplay(): void {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  private reiniciarAutoplay(): void {
    this.pararAutoplay();
    this.iniciarAutoplay();
  }
}
