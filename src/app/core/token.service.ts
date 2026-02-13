import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'convite_token';
const COOKIE_NAME = 'convite_token';
const COOKIE_MAX_AGE_DAYS = 90;

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly validSet: Set<string>;

  constructor() {
    const list = environment.validTokens ?? [];
    this.validSet = new Set(list.map((t) => t.trim()));
  }

  /**
   * Valida o token: deve estar na lista e, se tiver expiração (formato id.exp), a data deve ser futura.
   * Tokens sem ponto (ex.: convite-dev) não expiram.
   */
  isValid(token: string): boolean {
    const t = token?.trim();
    if (!t) return false;

    const hasExp = t.includes('.');
    if (hasExp) {
      if (!this.validSet.has(t)) return false;
      const parts = t.split('.');
      const expStr = parts[parts.length - 1];
      const exp = parseInt(expStr, 10);
      if (isNaN(exp)) return false;
      return Math.floor(Date.now() / 1000) < exp;
    }

    return Array.from(this.validSet).some((k) => k.toLowerCase() === t.toLowerCase());
  }

  hasValidToken(): boolean {
    const stored = this.getStored();
    return stored !== null && this.isValid(stored);
  }

  setToken(token: string): void {
    const t = token.trim();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, t);
    }
    this.setCookie(t);
  }

  getStored(): string | null {
    if (typeof sessionStorage !== 'undefined') {
      const fromStorage = sessionStorage.getItem(STORAGE_KEY);
      if (fromStorage) return fromStorage;
    }
    return this.getCookie();
  }

  clearToken(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
    this.deleteCookie();
  }

  private getCookie(): string | null {
    if (typeof document === 'undefined' || !document.cookie) return null;
    const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  private setCookie(token: string): void {
    if (typeof document === 'undefined') return;
    const hasExp = token.includes('.');
    let maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
    if (hasExp) {
      const parts = token.split('.');
      const exp = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(exp)) {
        maxAge = Math.max(0, exp - Math.floor(Date.now() / 1000));
      }
    }
    document.cookie =
      COOKIE_NAME +
      '=' +
      encodeURIComponent(token) +
      '; path=/; max-age=' +
      maxAge +
      '; SameSite=Lax';
  }

  private deleteCookie(): void {
    if (typeof document === 'undefined') return;
    document.cookie = COOKIE_NAME + '=; path=/; max-age=0';
  }
}
