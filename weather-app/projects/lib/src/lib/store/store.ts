import { Injector, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, Observable, distinctUntilChanged, map, scan } from 'rxjs';
import { Action } from './action.model';
import { Reducer } from './reducer.model';
import { STORE_INIT_ACTION_TYPE } from './store.const';

export type { Reducer };

export class Store<S, A extends Action> {
  private readonly stateSubject: BehaviorSubject<S>;
  private readonly actionSubject = new BehaviorSubject<A>({ type: STORE_INIT_ACTION_TYPE } as A);
  private readonly injector = inject(Injector);

  readonly state$: Observable<S>;
  readonly actions$: Observable<A>;

  constructor(initialState: S, reducer: Reducer<S, A>) {
    this.stateSubject = new BehaviorSubject<S>(initialState);
    this.actions$ = this.actionSubject.asObservable();

    this.state$ = this.actionSubject.pipe(
      scan((state, action) => reducer(state, action), initialState),
    );

    this.state$.subscribe(this.stateSubject);
  }

  dispatch(action: A): void {
    this.actionSubject.next(action);
  }

  getState(): S {
    return this.stateSubject.getValue();
  }

  select<R>(selector: (state: S) => R): Signal<R> {
    return toSignal(
      this.state$.pipe(
        map(selector),
        distinctUntilChanged(),
      ),
      { initialValue: selector(this.getState()), injector: this.injector },
    );
  }
}
