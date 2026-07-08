# React Native / Expo — File Structure & Reuse Conventions

## File-splitting pattern

React Native/Expo doesn't have Swift's `extension` mechanism, so the equivalent of "split by responsibility" is done via file/folder colocation rather than same-type extension files. Two common valid layouts — pick whichever matches what the project already does, or default to the folder form for anything non-trivial:

**Folder-per-component form (preferred for anything with real complexity):**
```
ContentDetailView/
├── index.tsx              — core: component shell, top-level JSX composition
├── ContentDetailView.hooks.ts    — custom hooks: state, effects, data-fetching logic
├── ContentDetailView.styles.ts   — StyleSheet.create(...) definitions
├── CardViews.tsx           — card-building subcomponents
├── ViewBuilders.tsx        — components that assemble rows/sections/conditional layout
└── handlers.ts             — event handler functions (onPress, navigation triggers)
```

**Flat sibling-file form (fine for smaller features):**
```
ContentDetailView.tsx
ContentDetailView.styles.ts
ContentDetailView.hooks.ts
```

**How to decide where a new piece goes:**
- Returns JSX for a specific card/cell → a card/subcomponent file
- Returns JSX that assembles or switches between other components → a view-builder/section file
- Runs in response to a user action, no JSX returned (navigation, API call trigger, analytics) → a handlers file
- Stateful logic reusable *within this component* (derived state, effects, subscriptions) → a custom hook in the `.hooks.ts` file, not inlined into the component body if it's non-trivial
- Style objects → `.styles.ts`, not inline `style={{...}}` for anything beyond a one-off tweak

## Reusable-logic placement

- Feature-scoped reusable code → stays inside that feature's folder (e.g. `ContentDetailView/hooks/useCardProgress.ts`), not promoted to a project-wide `src/hooks/` or `src/utils/` by default.
- Only promote to a shared location when a second, genuinely unrelated feature needs the same logic — surface this as a suggestion to the user rather than doing it automatically.
- A verbatim-repeated concept/definition (e.g. an "is in progress" check) is a good candidate for a small **custom hook** (`useIsInProgress(percent)`) or a plain exported function from a feature-scoped helpers file — whichever fits how it's consumed. If it's pure derived data with no side effects, a plain function is simpler than a hook; reach for a hook only when it needs to track state/effects/subscriptions.

## What NOT to extract (non-extractable boilerplate)

Short JSX wrapper elements and inline style tweaks repeat constantly and are not meaningful duplication:

```jsx
<View style={{ paddingHorizontal: 16 }} />
<Spacer height={12} />
```

Don't extract these based on repeat count alone — they're layout noise. If a *specific, consistent* style pattern is used across many components (e.g. a card's shadow/elevation styling), that's a candidate for a shared style constant or a small wrapper component — but that's a design-system decision, not a reflexive reaction to seeing the same `style={{}}` object twice.

## Magic literals

Hardcoded strings used as keys, route names, or fallback URLs (e.g. a default thumbnail URL, a content-type key like `"nc_reading"`) should become named constants on the second use, same as in Swift — this is about avoiding silent typo drift, not about line count.

## Long single-responsibility files

A component that branches across many rendered variants (e.g. one big conditional/switch rendering different card types based on a `type` prop) can get long while still being "one component." Before splitting into more files:
- Check whether each branch is independent enough to be its own small subcomponent — usually yes, and this maps directly to the card-view / view-builder split above.
- Group related JSX under clearly commented sections if a true split isn't warranted yet.
- Only pull a branch into its own file if it has enough surrounding logic (its own hooks, several sub-elements, non-trivial state) to be a real unit on its own — a single conditional branch rendering one simple element usually doesn't need its own file.

Mechanical file-length ceilings are better enforced via ESLint (e.g. `max-lines`) than decided here — this reference governs how to respond once a file is flagged long, not the threshold itself.
