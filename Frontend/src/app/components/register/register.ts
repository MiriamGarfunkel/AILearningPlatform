import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { LearningApiClient } from '../../core/learning-api.client';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatSnackBarModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userData = {
    id: '',
    name: '',
    phone: '',
  };

  constructor(
    private readonly gateway: LearningApiClient,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  onRegister() {
    if (!this.userData.id || !this.userData.name || !this.userData.phone) {
      return;
    }

    this.gateway.submitRegistrationEnvelope(this.userData).subscribe({
      next: () => {
        this.snackBar.open('Account created. You can sign in now.', 'OK', {
          duration: 4000,
          panelClass: ['success-snackbar'],
        });
        void this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        const message = err.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(message, 'OK', { duration: 6000, panelClass: ['error-snackbar'] });
      },
    });
  }
}