import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-error-banner',
  templateUrl: './error-banner.component.html',
  styleUrl: './error-banner.component.scss',
})
export class ErrorBannerComponent {
  readonly message = input<string | null>(null);
}
