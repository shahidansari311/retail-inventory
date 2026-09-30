import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  stats: any = null;
  loading: boolean = true;
  error: string = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.fetchDashboardStats();
  }

  fetchDashboardStats() {
    this.dashboardService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load dashboard statistics.';
        this.loading = false;
        console.error(err);
      }
    });
  }
}
