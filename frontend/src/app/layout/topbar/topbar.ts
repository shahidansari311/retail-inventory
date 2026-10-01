import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrl: './topbar.scss',
  templateUrl: './topbar.html',
})
export class Topbar implements OnInit {
  currentUser: any = null;
  userInitials = 'U';

  constructor(private authService: Auth) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user?.name) {
        const parts = user.name.trim().split(' ');
        this.userInitials = parts.length >= 2
          ? (parts[0][0] + parts[1][0]).toUpperCase()
          : parts[0][0].toUpperCase();
      }
    });
  }
}
