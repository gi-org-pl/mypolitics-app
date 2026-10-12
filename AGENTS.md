# AGENTS.md — Generacja Innowacja Front-End Standards

> **Purpose of this file:** condensed, machine-readable reference of all front-end standards from
> `docs/frontend/`. Use it as context when generating developer tasks, scoping tickets, reviewing PRs,
> writing acceptance criteria, or scaffolding new projects. Every rule below is enforceable — if a
> task contradicts it, the task description must call out the deviation explicitly and reference an
> approval from the Technical Leader.

---

## 0. Meta rules for task generation

When generating developer tasks based on this document:

- Always reference the canonical doc path (e.g. `docs/frontend/conventions/NAMING.md`) in the ticket
  description so the dev can drill in.
- Acceptance criteria must be testable against the conventions in §3 and tooling in §4.
- New projects must be bootstrapped from the
  [Vite Project Boilerplate](https://github.com/Generacja-Innowacja/vite-project-boilerplate). If a
  task creates a new repo, add a sub-task: "scaffold from vite-project-boilerplate".
- Any deviation from §4 (tooling) requires a sub-task: "obtain Technical Leader approval for the new tech".
- Default Definition of Done for any front-end task includes: lints clean (Biome), types clean
  (TypeScript strict), unit tests added/updated, e2e covers happy path if user-facing flow changed
  (what counts as "user-facing flow" is defined in §4.6).
- Every path a ticket names must exist in the §2 layout. Do not name grouping folders
  (`modules/`, `charts/`, `common/`, ...) between the domain folder and the component folder. The
  only extra level the layout has is the sub-domain folder of a large util folder (§2).

---

## 1. Stack at a glance

| Layer | Tool | Min version | Notes |
| --- | --- | --- | --- |
| Runtime | Node.js | >= 24 | Latest LTS only. |
| Package manager | Yarn | >= 1.22 | Lockfile must be committed. No npm/pnpm mixing. |
| Language | TypeScript | >= 5.9 | Strict mode assumed. |
| UI lib | React | >= 19 | |
| Build tool | Vite | >= 7 | |
| Routing | React Router | >= 7.9 | **Framework Mode** — not the legacy data router setup. |
| Styling | Tailwind CSS | >= 4 | Utility-first; avoid custom CSS unless unavoidable. |
| State (default) | React Context + `useState` | — | First reach. |
| State (complex) | Zustand | — | When Context is the wrong tool (perf, persistence, middleware). |
| HTTP | Axios | — | Use interceptors for auth/error handling. |
| Schema validation | Zod | — | Validate every API response; derive TS types from schemas. |
| i18n | Lingui | >= 6 | `<Trans>` / `t` macros; catalogs in `src/locales/`. |
| Linter + formatter | Biome | — | Replaces ESLint + Prettier. Base ruleset + Unicorn overrides. |
| Unit tests | Vitest + React Testing Library + React Test Renderer | — | Target coverage **95–100%**. |
| E2E tests | Playwright + Gherkin | — | All happy paths. |
| Component docs | Storybook | — | Living style guide for shared/design-system components. |

When you write a task that introduces a library, **default to "use the existing tool"**. Suggest a
new dependency only when nothing in the table above can do the job, and flag it as needing TL
approval.

---

## 2. Project structure (the only allowed layout)

```txt
|- public/                          # Non-functional static assets (favicon, thumbnails, etc.)
|- e2e/
|   |- [domain-name]/               # E2E grouped by domain
|       |- path-name.spec.ts        # Playwright spec, BDD/Gherkin style
|- src/
|   |- pages/                       # Route-level page components
|   |- components/
|   |   |- shared/                  # Cross-domain reusable components
|   |   |   |- [ComponentName]/
|   |   |- [domain-name]/           # Domain-specific components (home, admin, quiz, ...)
|   |       |- [ComponentName]/
|   |- services/                    # API clients — encapsulated per backend
|   |   |- [api-name]/              # e.g. api/, cms/
|   |       |- schemas/             # Zod schemas / data models
|   |       |- client/              # Axios instance + config
|   |       |- utils/               # Client helpers (interceptors, transforms)
|   |           |- [sub-domain]/    # e.g. error/, request/, survey/
|   |- constants/
|   |   |- [domain-name].ts         # e.g. common.ts, user.ts, config.ts
|   |- types/
|   |   |- [domain-name].ts         # Global types, split by domain
|   |- utils/
|   |   |- [domain-name]/           # e.g. number/, text/, object/
|   |       |- transformNumber.ts
|   |       |- transformNumber.test.ts
|   |       |- [sub-domain]/        # Only in a large domain folder (see below), e.g. survey/session/
|   |           |- createSession.ts
|   |           |- createSession.test.ts
|   |- locales/
|   |   |- [locale]/                # e.g. pl/, en/
|   |       |- messages.po          # Gettext source — edit this
|   |       |- messages.ts          # Compiled output — never edit directly
|   |- assets/
|       |- icons/                   # SVGs
|       |- images/                  # JPG, PNG, WebP, ...
```

Hard rules:

- **Domain code stays separated from global code.** Domain-only components live under
  `src/components/[domain-name]/`; only promote to `shared/` when ≥2 domains use it.
- **Every API client is encapsulated** under `src/services/[api-name]/`. Pages/components must not
  instantiate Axios or call `axios.get` directly.
- **All reusable code is easy to find.** If a util/type/constant is used by more than one component,
  it belongs in `src/utils/`, `src/types/`, or `src/constants/` — not next to a single component.
  §3.2 says exactly when to promote.
- **No extra folder layers.** A component folder sits directly under `src/components/shared/` or
  `src/components/[domain-name]/`. The only folders allowed below a component are its `utils/` and
  its own subcomponents (§3.2).

  ```txt
  src/components/results/modules/ResultsHeader/   # Wrong — `modules/` is neither a domain nor a component
  src/components/results/ResultsHeader/           # Right
  ```

- **A large util folder is split into sub-domain folders.** A folder of utils is flat until it
  passes about 12 source files (tests and fixtures do not count). From then on its files are
  grouped one level down, in folders named after what the files are about. This holds for
  `src/utils/[domain-name]/`, for `src/services/[api-name]/utils/` and for a component's own
  `utils/`.

  ```txt
  src/utils/survey/createSession.ts               # Wrong — one of 43 files in a flat folder
  src/utils/survey/session/createSession.ts       # Right
  src/utils/survey/helpers/createSession.ts       # Wrong — a catch-all, not a sub-domain
  src/utils/number/math/clamp.ts                  # Wrong — a small folder stays flat
  ```

  - One level only, `kebab-case`. No catch-all folder (`misc/`, `common/`, `helpers/`): a file that
    fits no sub-domain stays at the root of the util folder, as long as only a few do.
  - A file keeps its name, still holds one function, and its test and fixtures move with it.
  - Import a file of the same folder with `./name`, and a file of another sub-domain folder of
    `src/utils/` or `src/services/` through the alias (`@/utils/survey/session/createSession`).
  - Split the folder in the PR that takes it past the limit. Do not split a small folder ahead of
    time.

  This is the only grouping level the layout has, and it exists for utils alone. The rule above is
  unchanged: no grouping folder between a domain folder and a component folder.

When a ticket spans multiple files, follow the structure above when adding new files. Do not invent
new folders (top-level or in between) without TL approval.

**When a ticket or spec names a path that is not in this layout** and does not cite a Technical
Leader approval for it, use the layout above, and state in the PR description which path you used
instead and that the ticket needs updating. The layout wins because the first component placed in a
new folder becomes the pattern every later one copies.

---

## 3. Conventions

### 3.1 Naming (`docs/frontend/conventions/NAMING.md`)

- Functions / variables → `camelCase`
- React components → `PascalCase`
- Everything else → `kebab-case`

Concrete:

| Entity | Pattern | Example |
| --- | --- | --- |
| Domain folder | `kebab-case` | `user-profile/` |
| Component folder | `PascalCase` | `UserProfileCard/` |
| Sub-domain folder of utils (§2) | `kebab-case` | `session/`, `email-capture/` |
| Other folders | `kebab-case` | `utils/`, `schemas/` |
| Component file | `PascalCase.<type>.<ext>` | `UserProfileCard.tsx`, `UserProfileCard.types.ts` |
| Asset | `kebab-case.ext` | `arrow-right.svg`, `hero-banner.jpg` |
| Util / hook | `camelCase.ext` | `formatCurrency.ts`, `useDebounce.ts` |

Tasks that create files must use these patterns in acceptance criteria.

### 3.2 Component structure (`docs/frontend/conventions/COMPONENT_STRUCTURE.md`)

Three principles:

1. **Encapsulation** — types, utils, constants, and subcomponents used by only one component live
   inside that component's folder. If they're shared, they get promoted to globals.
2. **Minimization** — only create files/folders that are actually needed. No empty `index.ts`,
   `types.ts` etc. just for show.
3. **Mirroring** — folder structure mirrors the component tree (parent → subcomponent folders
   nested).

Canonical layout for a component:

```txt
|- ComponentName/
    |- ComponentName.tsx              # View
    |- ComponentName.test.ts          # Unit tests
    |- ComponentName.types.ts         # Component-scoped types
    |- ComponentName.constants.ts     # Component-scoped constants
    |- utils/                         # Component-scoped utils/hooks (only if needed)
    |   |- getSomeData.ts
    |   |- getSomeData.test.ts
    |- SubComponent/                  # Nested subcomponent (recursive structure)
    |- OtherSubComponent/
```

When writing a "create component X" task, default to listing the files above and explicitly drop the
ones not needed (rather than the other way around).

#### One component per file, composition only

A component's `.tsx` holds that component and nothing else: its JSX, its props destructuring and
calls to hooks/utils. Everything below moves out, because a piece that lives inside another
component's file cannot be found, reused or tested on its own.

| Found in the component file | Move it to |
| --- | --- |
| A function that returns JSX (`renderRow()`, `const renderFooter = () => <div/>`), at module level or inside the component | A subcomponent: `ComponentName/SubComponent/SubComponent.tsx` + its own test |
| Any other function besides the component (formatting, sorting, mapping, deriving values) | `ComponentName/utils/functionName.ts` + its own test — one function per file |
| Several `useState` / `useRef` / `useEffect` that serve one behaviour, or more than ~10 lines of derived state before the `return` | A local hook: `ComponentName/utils/useSomething.ts` + its own test |
| Types and interfaces; constants with a meaning of their own (thresholds, limits, maps) | `ComponentName.types.ts`; `ComponentName.constants.ts` |

Extract a subcomponent when **any** of these is true:

- The JSX is produced by a local function — always, regardless of size.
- The block has its own condition, state or handlers, or is a `.map()` body of more than one element.
- The component's `return` is longer than ~40 lines of JSX, or the file is longer than ~150 lines.
  These are signals that a split is missing, not numbers to squeeze under.

Do not extract a static wrapper of a few elements with no logic (Minimization still applies).

```tsx
// Don't — rendering function and helper inside the component file
const toLabel = (text?: string) => text?.trim() ?? "";

export const ResultCard = ({ title, entries }: ResultCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const renderFooter = () => <button onClick={() => setIsOpen(!isOpen)}>…</button>;

  return <Card title={toLabel(title)}>{renderFooter()}</Card>;
};

// Do — the parent only composes
export const ResultCard = ({ title, entries }: ResultCardProps) => {
  const { isOpen, toggle } = useResultCardView(entries);

  return (
    <Card title={toLabel(title)}>
      <ResultCardFooter isOpen={isOpen} onToggle={toggle} />
    </Card>
  );
};
```

```txt
|- ResultCard/
    |- ResultCard.tsx
    |- ResultCard.test.tsx
    |- ResultCardFooter/
    |   |- ResultCardFooter.tsx
    |   |- ResultCardFooter.test.tsx
    |- utils/
        |- toLabel.ts
        |- toLabel.test.ts
        |- useResultCardView.ts
        |- useResultCardView.test.ts
```

#### Local or global — when to promote

Search `src/utils/`, `src/types/` and `src/constants/` before writing a helper; reuse what exists.

| The util / type / constant is… | It lives in |
| --- | --- |
| Used by one component and written in that component's terms (takes its types, names its concepts) | The component folder (`utils/`, `.types.ts`, `.constants.ts`) |
| Used by a second component on its own account (not just to render the first one) — promote in the same PR that adds the second consumer and update both | `src/utils/[domain-name]/`, `src/types/[domain-name].ts`, `src/constants/[domain-name].ts` |
| General-purpose even with one consumer today: only primitives or generics in the signature, nothing about the component in its name or body (clamping a number, "is this a finite number", collapsing whitespace) | `src/utils/[domain-name]/` (`number/`, `text/`, `object/`, ...) |
| A subcomponent needed by a second parent | A sibling component in `src/components/[domain-name]/` (or `shared/` when ≥2 domains use it) |

When the domain folder has sub-domain folders (§2), the util goes into the one it is about:
`src/utils/[domain-name]/[sub-domain]/`.

Never keep a private copy of a helper that already exists globally, and never copy one from another
component — promote it.

**A component's public API types are not "shared" in this sense.** Its props type and the types that
describe its props (`RankedRowProps`, `RankedEntry`) stay in its `.types.ts`, however many parents
import them to render it. Promote a type to `src/types/` when components use it independently of
that component: a domain shape that several components take as input (`AxisOrientation`), or a type
a global util works with.

#### Imports between components

- Allowed: another component's view file and its `.types.ts`, in order to render it and build its
  props (`import { RankedRow } from "../RankedRow/RankedRow"`,
  `import type { RankedEntry } from "../RankedRow/RankedRow.types"`).
- Not allowed: anything from another component's `utils/`, its `.constants.ts`, or a subcomponent
  nested inside it. Needing one of these means it is shared: promote it per the table above.
- Self-check: no import path in the PR goes into a different component's folder and then into
  `utils/`, a `.constants` file or a nested component folder
  (`"../HorizontalBarChart/utils/getComparisonEntry"` is the pattern to look for).

### 3.3 Testing convention (`docs/frontend/conventions/TESTING_CONVENTION.md`)

Use **BDD / Given–When–Then** structure for both unit and e2e tests.

Vitest pattern:

```ts
describe('<Button />', () => {       // Given
  describe('when clicked', () => {   // When
    it('calls the handler', () => {  // Then
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

Playwright/Gherkin pattern:

```gherkin
Given a user is on the login page
When they enter valid credentials
Then they should be redirected to the dashboard
```

Acceptance-criteria phrasing for testing tasks should mirror Given/When/Then so devs translate
1:1 into test cases.

**Each unit is tested on its own.** Every subcomponent, util and hook has a test file next to it
that exercises it directly. The parent's test covers composition (which children appear, what is
passed to them, what happens on their callbacks); it does not replace the children's tests. When
code moves, its tests move with it.

### 3.4 Component sizing, stories and narrow widths

No canonical doc; these are repo rules. A component is placed by its parent, so it must not carry
assumptions about the frame it was drawn in.

- **Fluid width, automatic height.** The root element takes 100% of the parent's width (`w-full`)
  and its height comes from its content. Widths, heights and min-heights of the Figma frame are not
  component styles; neither are outer margins, nor the background or padding of the surface it was
  drawn on. Fixed sizes are fine for inner elements whose size is the design (icons, avatars, bar
  thickness).
- **Stories show the component alone.** No decorator or wrapper that adds a background, padding,
  border or fixed size (the global `withI18n` decorator is the only one). Check widths by resizing
  the viewport, not by wrapping the story.
- **Check every story at 320px, 360px and 800px** viewport width before opening the PR. At each
  width there is no horizontal scroll, the component is exactly as wide as its parent, and the three
  rules below hold.
- **Wrap primary text, do not truncate it.** Text that carries the result — names, values, the title
  of what is being shown — must be readable in full at 320px. Use `truncate` / `line-clamp` only for
  secondary text, for a single part that alone is longer than the line, or where the spec fixes the
  text to one line; in that last case give the text a shorter variant for narrow widths if one can
  be supplied.
- **Break multi-part labels at the part boundary.** For "Name — Value", when one line is not enough
  the separator moves to the next line together with the part it introduces:

  ```txt
  Economic axis — Social democracy     # fits
  Economic axis                        # does not fit: wrap here,
  — Social democracy                   # never "Economic a… — Social dem…"
  ```

  Do it in CSS (flex-wrap / inline layout with the separator and value in one non-breaking unit),
  not by measuring in JavaScript.
- **Data marks stay fully visible.** A point, marker or bar at the minimum or maximum value must not
  be cut by `overflow-hidden` or the container's rounded corners. Add a story for both extremes.

---

## 4. Tooling rules (per file in `docs/frontend/tools/`)

### 4.1 Fundamentals

- Node 24+, Yarn 1.22+, TypeScript 5.9+ — see §1.
- New projects must declare engines in `package.json` matching these versions.

### 4.2 React stack

- React 19+, Vite 7+, Tailwind 4+, React Router 7.9+ in **Framework Mode**.
- Storybook for any component intended for `shared/` or design-system reuse — a shared component
  without a story is incomplete.

### 4.3 State management

- Default: `useState` + `useContext`. Use this for theme, user prefs, simple shared state.
- Escalate to **Zustand** only when one of these triggers fires:
  - Frequent updates causing Context re-render perf issues.
  - State must persist across sessions (localStorage etc.).
  - Need for middleware (logging, devtools, persistence).
  - Multi-action complex global state.
- Tickets that introduce Zustand should justify which trigger applies.

### 4.4 API communication

- HTTP client: **Axios** with interceptors for auth + error normalization.
- Validation: **Zod** schemas validate every API response at runtime; derive TS types via
  `z.infer<typeof schema>`.
- Schemas live in `src/services/[api-name]/schemas/`. Client config in `client/`. Helpers in
  `utils/`.

### 4.5 Code quality

- **Biome** (Rust-based) replaces ESLint + Prettier. Base ruleset + **Unicorn** overrides.
- Lint runs on every commit and in CI.
- CI pipeline jobs (build, lint, test, e2e) must all pass before merge.

### 4.6 Testing

- **Pyramid:** lots of unit tests, few e2e tests.
- Unit: Vitest + @testing-library/react + React Test Renderer; **target 95–100% coverage**.
- E2E: Playwright + Gherkin; cover **all happy paths** (edge cases belong in unit tests).
- **When e2e is required** (repo clarification of "user-facing flow"): Playwright drives the running
  app, so a flow is user-facing once a user can reach it through a route in `src/pages/`.
  - The PR adds or changes something a user can do on a route (new page, a component mounted on a
    page, a changed step in an existing flow) → add or update the happy-path spec in
    `e2e/[domain-name]/`.
  - The PR adds or changes a component that no route renders yet → no e2e in that PR. Its
    interactions (open/close, keyboard, focus) are covered by unit tests, and the PR description says
    "No e2e: not mounted on any route". The PR that first mounts it on a page adds the e2e.
  - Do not create a route or test-only page just to give a component an e2e spec.
  - **Running e2e needs a running app, and the repo does not start one yet.** `yarn e2e` is only
    `playwright test`: `playwright.config.ts` has `webServer` and `baseURL` commented out, the only
    spec is the Playwright example, and the CI e2e job is switched off (`if: false`). The PR that
    adds the first real spec therefore also configures `webServer` (the built app via
    `yarn build && yarn preview`) and `baseURL` in `playwright.config.ts`, and enables the CI job —
    so that `yarn e2e` works by itself locally and in CI. Until then, do not report e2e as run.

### 4.7 Internationalisation (Lingui)

- **No hardcoded user-visible strings.** Every string rendered to the UI must go through a Lingui macro.
- JSX text → `<Trans>…</Trans>` from `@lingui/react`.
- Plain TS strings (attributes, ARIA labels, error messages) → `` t`…` `` or `msg`…`` from `@lingui/core`.
- Source locale is **`pl`**; supported locales: `pl`, `en`. Config lives in `lingui.config.js`.
- Catalogs: `src/locales/{locale}/messages.po` (human-editable) and `messages.ts` (generated — never edit by hand).
- Workflow when adding/changing strings:
  1. Write the macro in source.
  2. `yarn i18n:extract` — updates `.po` files.
  3. Translate the new entries in each `.po` file.
  4. `yarn i18n:compile` — regenerates `messages.ts`.
- `prebuild` runs `i18n:compile` automatically before `build`, `dev`, `test`, and `storybook`.
- The `I18nProvider` is set up in `src/root.tsx`; Storybook wraps every story via the `withI18n` decorator in `.storybook/preview.tsx`. Do not add additional providers.

---

## 5. Definition of Done — copy/paste into tickets

```md
- [ ] Code follows folder structure (docs/frontend/conventions/PROJECT_STRUCTURE.md)
- [ ] Naming follows docs/frontend/conventions/NAMING.md
- [ ] Components sit directly in src/components/[domain]/ or shared/ — no extra folder layer
- [ ] No util folder with more than ~12 source files is left flat — sub-domain folders, one level, no catch-all (§2)
- [ ] Component layout follows docs/frontend/conventions/COMPONENT_STRUCTURE.md
- [ ] Component files hold one component: no `renderX()` functions, no helpers — subcomponents, local `utils/`, local hooks instead
- [ ] Nothing imported from another component's `utils/`, constants or subcomponents; shared and general-purpose code promoted to src/utils, src/types, src/constants
- [ ] Unit tests added/updated, BDD style, coverage ≥95% on changed files; every subcomponent, util and hook has its own test file
- [ ] If the flow is reachable through a route: Playwright happy-path e2e added/updated (Gherkin); otherwise PR states "No e2e: not mounted on any route"
- [ ] Component fills its parent's width, height is automatic, no sizes copied from the Figma frame
- [ ] Stories checked at 320 / 360 / 800px: no horizontal scroll, primary text wraps instead of truncating, data marks not clipped
- [ ] Biome lint clean (no disabled rules without justification)
- [ ] TypeScript clean (no `any`, no `@ts-ignore` without comment)
- [ ] API responses validated with Zod
- [ ] Storybook story added, showing the component alone (no decorator background, padding or fixed size)
- [ ] State escalation to Zustand justified in PR description (if applicable)
- [ ] All user-visible strings wrapped in Lingui macros (`<Trans>`, `t`, `msg`) — no hardcoded literals
- [ ] `yarn i18n:extract` run after adding/changing strings; `.po` files committed
- [ ] CI green: build, lint, test (and e2e once the CI job is enabled, §4.6) — or, where CI did not run on the PR, local results listed in the PR
- [ ] PR description lists decisions and deviations from the ticket/spec; only files belonging to the task are committed
```

---

## 6. Quick decision tree (for ticket triage)

- "Where does this component go?" → used by ≥2 domains? `components/shared/`. Otherwise
  `components/[domain]/`. Directly there — no grouping folder, even if the ticket names one (§2).
- "Should this JSX be a subcomponent?" → produced by a local function, or has its own
  condition/state/handlers, or the file is past ~150 lines? Yes: nested folder, own test (§3.2).
- "Can this function stay in the component file?" → no. Local `utils/` (one function per file, own
  test); stateful logic becomes a local `useSomething` hook.
- "Local `utils/` or `src/utils/`?" → second consumer, or general-purpose (primitives in, primitives
  out, nothing component-specific)? Global. Otherwise local.
- "This util folder has a lot of files — may I add sub-folders?" → past about 12 source files: yes,
  one level of sub-domain folders named after what the files are about. Below that: no, it stays
  flat. Never `misc/`, `common/` or `helpers/` (§2).
- "Which folder of `src/utils/[domain-name]/` does the new util go into?" → the sub-domain folder it
  is about, if the domain has them; otherwise the domain folder itself.
- "Can I import that from another component?" → the component and its props types: yes. Its
  `utils/`, constants or subcomponents: no, promote them first.
- "Can I use the Figma frame's width/height?" → no. Parent's width, automatic height; stories without
  chrome (§3.4).
- "The label does not fit at 320px — truncate?" → not if it carries the result. Wrap it; break
  multi-part labels at the part boundary (§3.4).
- "Does this PR need an e2e spec?" → can a user reach the change through a route? Yes: add it. No:
  unit tests, and say so in the PR (§4.6).
- "The reviewer asks for something the ticket contradicts?" → follow the reviewer, note in the PR
  that the ticket/spec needs updating (§8).
- "Should I add Zustand?" → can Context + useState do it without perf pain or middleware? If yes,
  no.
- "Should I write a custom CSS file?" → almost never. Use Tailwind utilities. Justify the exception.
- "Should I use fetch?" → no. Use the Axios client from `services/[api-name]/client/`.
- "Should I trust the API response shape?" → no. Run it through a Zod schema.
- "Where do unit tests live?" → next to the file under test, same name with `.test.ts(x)`.
- "Where do e2e tests live?" → `e2e/[domain]/[path-name].spec.ts`.
- "Should I hardcode a string in JSX?" → no. Use `<Trans>` for JSX text, `` t`…` `` or `msg`…`` for plain TS strings.
- "Where do translations live?" → `src/locales/{locale}/messages.po` (source). Run `yarn i18n:extract` then `yarn i18n:compile` after changes.
- "New top-level dependency or framework?" → needs Technical Leader approval; add a sub-task.

---

## 7. Source-of-truth doc map

| Topic | Doc |
| --- | --- |
| Index | `docs/frontend/INDEX.md` |
| Component structure | `docs/frontend/conventions/COMPONENT_STRUCTURE.md` |
| Naming | `docs/frontend/conventions/NAMING.md` |
| Project structure | `docs/frontend/conventions/PROJECT_STRUCTURE.md` |
| Testing convention (BDD) | `docs/frontend/conventions/TESTING_CONVENTION.md` |
| API communication | `docs/frontend/tools/API_COMMUNICATION.md` |
| Code quality | `docs/frontend/tools/CODE_QUALITY.md` |
| Fundamentals (Node/Yarn/TS) | `docs/frontend/tools/FUNDAMENTALS.md` |
| React stack | `docs/frontend/tools/REACT.md` |
| State management | `docs/frontend/tools/STATE_MANAGEMENT.md` |
| Testing tools | `docs/frontend/tools/TESTING.md` |
| i18n (Lingui) | `lingui.config.js`, `src/locales/` |
| Boilerplate | <https://github.com/Generacja-Innowacja/vite-project-boilerplate> |

---

## 8. Working process (environment, commits, PRs, review feedback)

### 8.1 Before running anything

- Run `node -v` first. The shell's default Node can be older than the required 24, and then every
  `yarn` script and the pre-commit hook fail with errors that look unrelated. Switch to Node >= 24
  (e.g. `nvm use 24`) in the same shell before any script or commit. Do not bypass the hook
  (`--no-verify`) to get around a wrong Node version.

### 8.2 Commits

- The pre-commit hook runs `yarn lint:fix` and `yarn i18n:extract` on the whole repo. Both rewrite
  files, so run them yourself **before staging**, then stage.
- After every commit run `git status`. What the hook left modified is either yours (typically
  `.po` line references that moved with your code — commit them) or not yours (a file you never
  touched that got re-formatted — restore it, do not commit it).
- A commit contains only files that belong to the task. Stage paths explicitly; no `git add -A`.

### 8.3 Pull requests

- Follow `.github/pull_request_template.md`. Under Changes, besides what was done, list:
  - **Decisions** — every choice the ticket left open, and what you chose.
  - **Deviations** — every place the result differs from the ticket, the spec or this file, with the
    reason (including "the ticket named a path outside the §2 layout").
  - **Verification** — the commands you ran and their results (tests passed, coverage of changed
    files), and the viewport widths you checked.
- CI is only set up for PRs that target `main` or `develop`. A stacked PR (targeting another
  feature branch) may get no checks at all, so before opening it run `yarn lint`,
  `yarn test:coverage` and `yarn build` locally (and `yarn e2e` when §4.6 requires a spec — see
  there for what that needs) and state the results in the PR. Look at the PR's checks afterwards and
  never describe a PR as "CI green" when CI did not run on it.

### 8.4 Review feedback

- A human reviewer's instruction overrides the ticket and the spec. Implement it, and state in the
  PR which sentence of the ticket/spec is now outdated so it can be corrected at the source. If it
  contradicts this file, do not silently pick one: name the conflict in the PR — the Technical
  Leader's word decides, and this file is then updated to match.
- Comments from an automated reviewer are suggestions: check each against the code, then fix it or
  decline it with a concrete reason. Do not leave a comment unanswered.
- A remark made on one component applies to all of them. Before replying, search your PR for the
  same pattern elsewhere and fix every occurrence.
