import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, Router } from '@angular/router';
import { LearningApiClient } from '../../core/learning-api.client';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, 
    MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule
  ],
  templateUrl: './register.html'
})
export class Register {
  // התאמה למבנה ה-Backend: id, name, phone
  userData = {
    id: '',    // תעודת זהות (הופך ל-_id בשרת)
    name: '',
    phone: ''
  };

  constructor(
    private readonly gateway: LearningApiClient,
    private router: Router,
  ) {}

  onRegister() {
    // בדיקה בסיסית לפני השליחה
    if (!this.userData.id || !this.userData.name || !this.userData.phone) {
      return;
    }

    // שליחה ל-API
    this.gateway.submitRegistrationEnvelope(this.userData).subscribe({
    
      next: (res: any) => {
      localStorage.setItem('token', res.token);
      localStorage.setItem('userId', (res.data as any)._id);
      localStorage.setItem('userName', (res.data as any).name);
      localStorage.setItem('role', (res.data as any).role);
      this.router.navigate(['/dashboard']);
      },

      error: (err) => {
        console.error(err);
      }
    });
  }
}