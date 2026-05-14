import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userRole = localStorage.getItem('role');

  if (userRole === 'admin') {
    return true;
  } else {
    void router.navigate(['/dashboard']);
    return false;
  }
};