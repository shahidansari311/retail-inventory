import { Component, inject } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss'
})
export class Sidebar {
  private authService = inject(Auth);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
