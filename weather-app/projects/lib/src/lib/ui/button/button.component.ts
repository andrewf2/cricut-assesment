import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lib-button',
  imports: [MatButtonModule],
  template: `
    <button
      mat-stroked-button
      [disabled]="disabled()"
      (click)="clicked.emit()"
    >
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly disabled = input(false);
  readonly clicked = output<void>();
}
