import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LearningApiClient } from '../../core/learning-api.client';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  id = '';
  name = '';
  phone = '';

  constructor(
    private readonly gateway: LearningApiClient,
    private router: Router,
  ) {}

  onSubmit() {
    const loginPayload = {
      id: this.id,
      name: this.name,
      phone: this.phone
    };
    this.gateway.establishSession(loginPayload).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.data._id); 
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('role', res.data.role);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}