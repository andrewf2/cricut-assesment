import { Component } from '@angular/core';
import { SKELETON_CARD_COUNT } from './loading-skeleton.const';

@Component({
  selector: 'lib-loading-skeleton',
  templateUrl: './loading-skeleton.component.html',
  styleUrl: './loading-skeleton.component.scss',
})
export class LoadingSkeletonComponent {
  readonly skeletonCards = Array.from({ length: SKELETON_CARD_COUNT }, (_, i) => i + 1);
}
