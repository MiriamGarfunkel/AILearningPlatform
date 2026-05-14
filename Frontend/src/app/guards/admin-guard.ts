import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userRole = localStorage.getItem('role'); // שמירת תפקיד המשתמש בזמן לוגין

  if (userRole === 'admin') {
    return true;
  } else {
    router.navigate(['/dashboard']); // אם הוא לא אדמין, החזר אותו לדף הבית
    return false;
  }
};