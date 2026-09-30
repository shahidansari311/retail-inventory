import { Component, OnInit , ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockMovementService } from '../../services/stock-movement';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-movements.html',
  styleUrls: ['./stock-movements.scss']
})
export class StockMovements implements OnInit {
  movements: any[] = [];
  loading = false;
  saving = false;
  error = '';

  showForm = false;
  formData: any = { productId: null, warehouseId: null, movementType: 'IN', quantity: 1, reason: '' };
  formError = '';

  constructor(private movementService: StockMovementService, private toast: ToastService, private cdr: ChangeDetectorRef) {}

  ngOnInit() { this.loadMovements(); }

  loadMovements() {
    this.loading = true;
    this.error = '';
    this.movementService.getAll().subscribe({
      next: (data) => { this.movements = data; this.loading = false; },
      error: (err) => {
        this.error = 'Failed to load stock movements.';
        this.loading = false;
        this.toast.error(this.error);
      }
    });
  }

  openAddForm() {
    this.formData = { productId: null, warehouseId: null, movementType: 'IN', quantity: 1, reason: '' };
    this.formError = '';
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.formError = '';
  }

  saveMovement() {
    this.saving = true;
    this.formError = '';
    
    this.movementService.create(this.formData).subscribe({
      next: () => {
        this.toast.success('Stock movement recorded successfully!');
        this.loadMovements();
        this.closeForm();
        this.saving = false;
      },
      error: (err) => {
        this.formError = err.error?.message || 'Failed to record stock movement.';
        this.toast.error(this.formError);
        this.saving = false;
      }
    });
  }
}
