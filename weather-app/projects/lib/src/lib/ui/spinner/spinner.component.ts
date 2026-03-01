import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'lib-spinner',
  imports: [MatProgressSpinnerModule],
  template: `<mat-spinner [diameter]="diameter()" />`,
})
export class SpinnerComponent {
  readonly diameter = input(20);
}
