import { Component , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class Register {
  registerForm: FormGroup;
  loading = false;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private router: Router,
    private toast: ToastService
  , private cdr: ChangeDetectorRef) {
    this.registerForm = this.fb.group({
      name:     ['', [Validators.required, Validators.minLength(2)]],
      email:    ['', [Validators.required, Validators.email]],
      role:     ['USER', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8),
                       Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)]]
    });
  }

  get f() { return this.registerForm.controls; }

  fieldError(field: string): string {
    const ctrl = this.f[field];
    if (!ctrl.errors || (!this.submitted && !ctrl.dirty)) return '';
    if (ctrl.errors['required'])   return `${this.fieldLabel(field)} is required`;
    if (ctrl.errors['minlength'])  return `${this.fieldLabel(field)} must be at least ${ctrl.errors['minlength'].requiredLength} characters`;
    if (ctrl.errors['email'])      return 'Enter a valid email address';
    if (ctrl.errors['pattern'])    return 'Password must have uppercase, lowercase, and a number';
    return '';
  }

  private fieldLabel(field: string): string {
    return { name: 'Full name', email: 'Email', password: 'Password', role: 'Role' }[field] || field;
  }

  onSubmit() {
    this.submitted = true;
    if (this.registerForm.invalid) {
      this.toast.warning('Please fix the errors below before submitting.');
      return;
    }
    this.loading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.toast.success(`Account created as ${this.registerForm.value.role}! Welcome to RetailPro.`);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        const msg = err.status === 409 ? 'This email is already registered. Try signing in.'
                  : err.status === 429 ? 'Too many attempts. Please wait a moment.'
                  : err.status === 0   ? 'Cannot reach server. Check your connection.'
                  : err.error?.message || 'Registration failed. Please try again.';
        this.toast.error(msg);
        this.loading = false;
      }
    });
  }
}
