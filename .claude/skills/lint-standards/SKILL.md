# /lint-standards

Scan changed files against the AGENTS.md coding standards and report violations.

## Instructions

1. Read `weather-app/AGENTS.md` to load the current coding standards.
2. Find changed files by running `git diff --name-only` (staged + unstaged) and `git diff --name-only --cached`.
3. Read each changed `.ts` and `.html` file.
4. Check for these violations:

| Rule | What to check |
|------|---------------|
| **20-line function limit** | Count lines of code in each function/method body (exclude blanks and signature). Flag any exceeding 20. |
| **No template function bindings** | In `.html` files, flag `{{ functionName() }}` or `[prop]="functionName()"` patterns (event bindings like `(click)` are OK). |
| **Readonly on signals/services** | Injected services (`inject(...)`) and signals (`signal(...)`, `computed(...)`) must be `readonly`. |
| **Explicit return types** | Public methods (not private/protected) must have explicit return type annotations. |
| **No `any` in public APIs** | `input()`, `output()`, public method params/returns must not use `any`. Internal `any` is OK. |
| **`@if`/`@for` control flow** | Flag `*ngIf` and `*ngFor` usage — should use `@if` and `@for` instead. |
| **Immutable state** | In reducer files, flag `.push(`, `.splice(`, direct mutation patterns. |
| **Action naming** | Actions must follow `[Feature] Verb Noun` pattern. |

5. Report violations with `file:line` references.
6. Suggest a fix for each violation.
7. If no violations found, report all checks passed.
