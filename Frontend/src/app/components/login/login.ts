import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiClient } from '../../core/learning-api.client';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';

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
    RouterLink,
    MatSnackBarModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  id = '';
  name = '';
  phone = '';
  adminEmail = '';
  adminPassword = '';
  isAdminIntent = false;
  private postLoginRedirect: string | null = null;

  constructor(
    private readonly gateway: ApiClient,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // Snapshot avoids a one-frame flash when opening /login?mode=admin
    this.applyQueryParams(this.route.snapshot.queryParamMap);
    this.route.queryParamMap.subscribe((params) => this.applyQueryParams(params));
  }

  private applyQueryParams(params: ParamMap): void {
    const mode = (params.get('mode') ?? '').toLowerCase().trim();
    this.isAdminIntent = mode === 'admin';

    const raw = (params.get('redirect') ?? '').trim();
    const normalized = raw.replace(/\/+$/, '') || raw;
    this.postLoginRedirect =
      normalized && normalized.startsWith('/') && !normalized.startsWith('//') ? normalized : null;

    if (this.isAdminIntent) {
      const p = environment.adminSignInPrefill;
      this.adminEmail = p?.email ?? '';
      this.adminPassword = p?.password ?? '';
    } else {
      this.adminEmail = '';
      this.adminPassword = '';
    }
  }

  onSubmit(ev?: Event): void {
    if (ev && 'preventDefault' in ev) {
      ev.preventDefault();
    }

    if (this.isAdminIntent) {
      const email = this.adminEmail.trim();
      if (!email || !this.adminPassword) {
        this.snackBar.open('Enter email and password to continue.', 'OK', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
        return;
      }
    }

    const loginPayload = this.isAdminIntent
      ? { email: this.adminEmail.trim(), password: this.adminPassword }
      : {
          id: this.id,
          name: this.name,
          phone: this.phone,
        };

    this.gateway.login(loginPayload).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('userId', res.data._id);
        localStorage.setItem('userName', res.data.name);
        localStorage.setItem('role', res.data.role);

        const role = res.data.role as string;
        let target = '/dashboard';
        if (this.isAdminIntent) {
          target = role === 'admin' ? '/admin' : '/dashboard';
          if (role !== 'admin') {
            this.snackBar.open('This account is not an administrator.', 'OK', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar'],
            });
          }
        } else if (this.postLoginRedirect) {
          target = this.postLoginRedirect;
        }

        void this.router.navigateByUrl(target);
      },
      error: (err) => {
        console.error(err);
        if (
          this.isAdminIntent &&
          environment.adminLocalBypassOnFailedLogin &&
          !environment.production
        ) {
          const email = this.adminEmail.trim();
          const localName = email.includes('@') ? email.split('@')[0]!.trim() : email;
          localStorage.setItem('token', 'local-dev-admin-bypass');
          localStorage.setItem('userId', 'local-dev-admin');
          localStorage.setItem('userName', localName || 'Admin');
          localStorage.setItem('role', 'admin');
          this.snackBar.open(
            'Local dev: API sign-in failed — using offline admin session. Fix the backend for a real token.',
            'OK',
            {
              duration: 8000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
              panelClass: ['error-snackbar'],
            },
          );
          void this.router.navigateByUrl('/admin');
          return;
        }
        const message = err.error?.message || 'Sign-in failed. Check your details and try again.';
        this.snackBar.open(message, 'OK', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }
}
