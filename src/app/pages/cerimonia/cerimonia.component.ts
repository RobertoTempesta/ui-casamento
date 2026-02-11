import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cerimonia',
  standalone: true,
  templateUrl: './cerimonia.component.html',
  styleUrl: './cerimonia.component.scss',
})
export class CerimoniaComponent {
  /** Google Maps embed - Paróquia São José, Santa Cruz do Rio Pardo, zoom 17 */
  readonly mapSrc: SafeResourceUrl;

  constructor(sanitizer: DomSanitizer) {
    // Google Maps: Paróquia São José, Santa Cruz do Rio Pardo (-22.8989, -49.6314), zoom 17
    // t=s = satélite, t=k = híbrido (satélite + rótulos)
    const url = 'https://maps.google.com/maps?q=-22.9104048,-49.6343965&z=17&t=s&output=embed';
    this.mapSrc = sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
