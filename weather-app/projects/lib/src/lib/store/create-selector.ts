type Selector<S, R> = (state: S) => R;

export function createSelector<S, R1, Result>(
  s1: Selector<S, R1>,
  projector: (r1: R1) => Result,
): Selector<S, Result>;

export function createSelector<S, R1, R2, Result>(
  s1: Selector<S, R1>,
  s2: Selector<S, R2>,
  projector: (r1: R1, r2: R2) => Result,
): Selector<S, Result>;

export function createSelector<S, R1, R2, R3, Result>(
  s1: Selector<S, R1>,
  s2: Selector<S, R2>,
  s3: Selector<S, R3>,
  projector: (r1: R1, r2: R2, r3: R3) => Result,
): Selector<S, Result>;

export function createSelector<S>(...args: any[]): Selector<S, any> {
  const projector = args[args.length - 1] as (...vals: any[]) => any;
  const selectors = args.slice(0, -1) as Selector<S, any>[];

  let lastInputs: any[] | null = null;
  let lastResult: any = undefined;

  return (state: S) => {
    const inputs = selectors.map(s => s(state));

    if (
      lastInputs !== null &&
      inputs.length === lastInputs.length &&
      inputs.every((val, i) => val === lastInputs![i])
    ) {
      return lastResult;
    }

    lastInputs = inputs;
    lastResult = projector(...inputs);
    return lastResult;
  };
}
