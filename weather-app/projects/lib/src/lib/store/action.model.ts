export interface Action {
  readonly type: string;
}

export interface ActionCreator<T extends string, P = void> {
  readonly type: T;
  (payload: P): Action & { type: T; payload: P };
}
