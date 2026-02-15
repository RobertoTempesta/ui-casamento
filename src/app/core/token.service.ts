import { Injectable } from '@angular/core';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getFirestoreInstance } from './firebase.config';

const STORAGE_KEY = 'convite_token';
const COOKIE_NAME = 'convite_token';
const COOKIE_MAX_AGE_DAYS = 90;
const TOKENS_COLLECTION = 'tokens';

@Injectable({ providedIn: 'root' })
export class TokenService {
  /**
   * Verifica se o token armazenado ainda está dentro do prazo (expiração no formato id.exp).
   */
  private isStoredTokenNotExpired(token: string): boolean {
    const t = token?.trim();
    if (!t) return false;
    if (!t.includes('.')) return true; // sem expiração
    const parts = t.split('.');
    const exp = parseInt(parts[parts.length - 1], 10);
    if (isNaN(exp)) return true;
    return Math.floor(Date.now() / 1000) < exp;
  }

  /**
   * Obtém o timestamp de expiração em segundos (Unix).
   * Aceita número ou Firestore Timestamp ({ seconds, nanoseconds }).
   */
  private getExpiraEmSeconds(expiraEm: unknown): number | null {
    if (expiraEm == null) return null;
    if (typeof expiraEm === 'number' && !isNaN(expiraEm)) return expiraEm;
    const ts = expiraEm as { seconds?: number; toMillis?: () => number };
    if (typeof ts.seconds === 'number') return ts.seconds;
    if (typeof ts.toMillis === 'function') return Math.floor(ts.toMillis() / 1000);
    return null;
  }

  /**
   * Valida o token no Firestore: existe na collection `tokens`, não está expirado (expiraEm)
   * e não foi marcado como usado (usado !== true).
   */
  async isValidAsync(token: string): Promise<boolean> {
    const t = token?.trim();
    if (!t) return false;

    try {
      const db = getFirestoreInstance();
      const col = collection(db, TOKENS_COLLECTION);
      const q = query(col, where('token', '==', t));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return false;

      const doc = snapshot.docs[0].data();
      if (doc['usado'] === true) return false;

      const expSeconds = this.getExpiraEmSeconds(doc['expiraEm']);
      if (expSeconds != null && Math.floor(Date.now() / 1000) >= expSeconds) return false;

      return true;
    } catch {
      // Firestore indisponível ou erro de rede
      return false;
    }
  }

  hasValidToken(): boolean {
    const stored = this.getStored();
    return stored !== null && this.isStoredTokenNotExpired(stored);
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
