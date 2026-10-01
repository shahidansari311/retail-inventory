import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService } from '../../services/dashboard';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  stats: any = null;
  loading: boolean = true;
  error: string = '';
  hasData: boolean = false;
  
  today = new Date();
  role = 'USER';
  userName = 'User';

  private authService = inject(Auth);

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.role = user.role || 'USER';
        this.userName = user.name || 'User';
      }
    });
    this.fetchDashboardStats();
  }

  hasAccess(allowedRoles: string[]): boolean {
    return allowedRoles.includes(this.role);
  }

  fetchDashboardStats() {
    this.loading = true;
    this.error = '';
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data ?? {};
        // Check if there is actual data, else show empty state
        this.hasData = (data?.totalProducts ?? 0) > 0 || (data?.totalSuppliers ?? 0) > 0 || (data?.totalCategories ?? 0) > 0 || (data?.totalOrders ?? 0) > 0;
        this.loading = false;
        this.cdr.detectChanges(); // Ensure UI updates
      },
      error: (err) => {
        this.error = 'Failed to load dashboard statistics.';
        this.loading = false;
        this.cdr.detectChanges(); // Ensure UI updates
      }
    });
  }
}

