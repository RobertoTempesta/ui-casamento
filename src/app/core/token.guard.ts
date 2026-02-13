import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TokenService } from './token.service';

export const tokenGuard: CanActivateFn = (route) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  const tokenFromUrl = route.queryParams['token'];
  if (tokenFromUrl) {
    if (tokenService.isValid(tokenFromUrl)) {
      tokenService.setToken(tokenFromUrl);
      const path = route.url.map((s) => s.path).filter(Boolean);
      const pathStr = path.length ? '/' + path.join('/') : '/';
      router.navigateByUrl(pathStr, { replaceUrl: true });
      return true;
    }
  }

  if (tokenService.hasValidToken()) return true;

  router.navigate(['/entrar'], { queryParams: { returnUrl: route.url.join('/') || undefined } });
  return false;
};
