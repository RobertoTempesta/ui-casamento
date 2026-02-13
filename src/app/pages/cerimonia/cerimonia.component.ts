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
    const mapUrl = 'https://maps.google.com/maps?q=-22.9104048,-49.6343965&z=17&t=s&output=embed';
    this.mapSrc = sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }
}
