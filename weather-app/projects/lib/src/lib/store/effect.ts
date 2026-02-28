import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, filter } from 'rxjs';
import { Action } from './action.model';
import { Store } from './store';

export function ofType<A extends Action, T extends string>(
  ...types: T[]
): (source: Observable<A>) => Observable<Extract<A, { type: T }>> {
  return (source) =>
    source.pipe(
      filter((action): action is Extract<A, { type: T }> =>
        types.includes(action.type as T),
      ),
    );
}

export abstract class Effects<A extends Action> {
  protected readonly destroyRef = inject(DestroyRef);

  constructor(protected readonly store: Store<any, A>) {
    // Subclasses register effects in their constructor
  }

  protected createEffect(effect$: Observable<A>): void {
    effect$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((action) => this.store.dispatch(action));
  }

  protected createEffectNoDispatch(effect$: Observable<any>): void {
    effect$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
