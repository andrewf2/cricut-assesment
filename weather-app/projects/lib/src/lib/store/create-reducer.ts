import { Action, ActionCreator } from './action.model';
import { ActionHandler } from './action-handler.model';

export function on<S, T extends string, P>(
  actionCreator: ActionCreator<T, P>,
  handler: (state: S, action: Action & { type: T; payload: P }) => S,
): ActionHandler<S, Action & { type: T; payload: P }> {
  return { type: actionCreator.type, handler };
}

export function createReducer<S>(
  initialState: S,
  ...handlers: ActionHandler<S, any>[]
): (state: S | undefined, action: Action) => S {
  const handlerMap = new Map<string, (state: S, action: any) => S>();

  for (const h of handlers) {
    handlerMap.set(h.type, h.handler);
  }

  return (state: S | undefined = initialState, action: Action): S => {
    const handler = handlerMap.get(action.type);
    return handler ? handler(state!, action) : state!;
  };
}
