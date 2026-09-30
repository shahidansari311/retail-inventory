import { Component , ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  loginForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private toast: ToastService
  , private cdr: ChangeDetectorRef) {
    this.loginForm = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get f() { return this.loginForm.controls; }

  fieldError(field: string): string {
    const ctrl = this.f[field];
    if (!ctrl.errors || (!this.submitted && !ctrl.dirty)) return '';
    if (ctrl.errors['required'])  return `${field === 'email' ? 'Email' : 'Password'} is required`;
    if (ctrl.errors['email'])     return 'Enter a valid email address';
    if (ctrl.errors['minlength']) return `Password must be at least ${ctrl.errors['minlength'].requiredLength} characters`;
    return '';
  }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.toast.warning('Please fix the errors below before submitting.');
      return;
    }
    this.loading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.toast.success('Welcome back! Redirecting...');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const msg = err.status === 401 ? 'Invalid email or password'
                  : err.status === 429 ? 'Too many attempts. Please wait a moment.'
                  : err.status === 0   ? 'Cannot reach server. Check your connection.'
                  : err.error?.message || 'Login failed. Please try again.';
        this.toast.error(msg);
        this.loading = false;
      }
    });
  }
}
