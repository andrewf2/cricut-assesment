import { Action } from './action.model';

export interface ActionHandler<S, A extends Action> {
  readonly type: string;
  readonly handler: (state: S, action: A) => S;
}
