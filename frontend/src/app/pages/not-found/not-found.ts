import { Component , ChangeDetectorRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss'
})
export class NotFound {
  constructor(private location: Location, private cdr: ChangeDetectorRef) {}

  goBack() {
    this.location.back();
  }
}
