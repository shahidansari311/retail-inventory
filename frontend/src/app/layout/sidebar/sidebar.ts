import { Component, inject, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar implements OnInit {
  private authService = inject(Auth);
  private router = inject(Router);

  role: string = 'USER';

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.role = user?.role || 'USER';
    });
  }

  hasAccess(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.role);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
