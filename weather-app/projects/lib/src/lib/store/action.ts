import { Action, ActionCreator } from './action.model';

export type { Action, ActionCreator };

export function createAction<T extends string>(type: T): ActionCreator<T, void>;
export function createAction<T extends string, P>(type: T): ActionCreator<T, P>;
export function createAction<T extends string, P = void>(type: T): ActionCreator<T, P> {
  const creator = ((payload: P) => ({ type, payload })) as ActionCreator<T, P>;
  (creator as any).type = type;
  return creator;
}
