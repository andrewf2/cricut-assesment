import { Action } from './action.model';

export type Reducer<S, A extends Action> = (state: S, action: A) => S;
