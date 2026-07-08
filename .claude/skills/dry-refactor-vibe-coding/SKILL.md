---
name: dry-refactor-vibe-coding
description: Use this whenever writing, generating, or reviewing application code during vibe-coding sessions — especially when adding a new screen/view/component, extending an existing feature, or when the user asks to "clean up," "refactor," or "make this more reusable." Guides Claude to detect genuinely reusable logic vs. coincidental similarity, avoid premature/over-abstraction, and split files by responsibility rather than dumping a whole feature into one file. Covers Swift/SwiftUI and React Native/Expo conventions specifically. Trigger this proactively even if the user just asks for a new feature or component and doesn't explicitly mention "duplication," "DRY," or "refactor" — the goal is to write reusable, well-structured code by default, not just when asked.
---

# DRY & Structure for Vibe-Coding

## Why this exists

When generating code quickly, it's easy to either (a) copy-paste the same logic repeatedly, or (b) overcorrect and extract everything into shared helpers on sight — including things that only *look* similar but aren't really the same concept. Both failure modes create maintenance debt. This skill exists to make the *judgment call* correctly, not just apply a mechanical rule.

The other common failure mode in vibe-coding is dumping an entire feature into one file because it's fast to write that way. That file becomes unreadable and unreviewable within a few sessions.

This skill has two jobs: **(1) decide what's actually worth extracting**, and **(2) decide how a feature's code should be split across files.**

## Scope boundary — read this first

**All duplication checks operate within a bounded unit — the feature folder currently being worked on. Never scan or compare against the whole codebase.**

Before applying any rule below, state the scope out loud, e.g.: *"Checking for reuse within `NCxAITop/`."*

Why this matters: in any large codebase, unrelated features will independently reuse similar names, similar shapes, or similar small patterns purely by coincidence. Treating every project-wide match as "duplication to fix" produces constant false positives and pushes toward premature global abstractions. Two different features having similar-looking code is normal and not a problem to solve.

- Default unit = the feature folder (e.g. everything under `NCxAITop/`, or `screens/Checkout/`).
- If no clear feature folder exists yet (e.g. a single new file), the unit is that file, or the small set of files being created together in this task.
- If you notice a similar pattern in a *different, unrelated* feature while working, you may mention it as an observation — but never act on it unprompted. Promoting something to a shared/global location is always a manual, human decision (see "Reusability scope" below).

## Part 1: Deciding what's reusable

### The real test (not just a line-count rule)

Line count and repeat count are **triggers to stop and evaluate** — they are not the final answer by themselves. The actual question to ask:

> **If this logic changes tomorrow, should every occurrence change together, or might they legitimately need to diverge?**

- **Change-together (same concept, same source of truth) → extract.**
  Example: a definition like "is this item in progress" (`percent > 0 && percent < 100`) means the same thing everywhere it appears. If the threshold definition changes, every copy must update in lockstep. This should be extracted even if it's short and appears in an unexpected place.

- **Similar shape, different meaning per call site → do NOT force together.**
  Example: two functions that each build a card view from a different model type (one from a lesson item, one from a training item) can look nearly identical field-for-field, but they pull from different sources, with different optionality and different fallback rules. Forcing them into one shared function just relocates the mapping logic to the call site and adds parameters/flags instead of removing duplication. Keeping them as separate, clearly-named functions is often the *correct* outcome, not a missed opportunity.
  
  A red flag that you've forced two different concepts together: the "reusable" function needs several optional parameters or boolean flags just to keep accommodating each new caller. More than 2-3 of these is a sign it's not actually one concept — reconsider rather than keep bolting on flags.

### Thresholds for triggering the evaluation

**Blocks of 5+ lines, appearing 2+ times within the feature scope:** stop and apply the change-together test above.

**Blocks under 5 lines:** don't use a raw repeat-count rule (e.g. "3 times") — short blocks need a *kind*-based check instead, because short code splits into very different buckets:

| Kind | Example | Action |
|---|---|---|
| Named concept / definition, repeated verbatim | an "in progress" check, a validity check | Extract even on the 2nd occurrence, regardless of line count — a typo'd re-implementation is a silent bug |
| Magic literal / constant used more than once | a default placeholder URL, a hardcoded key string like `"nc_reading"` | Extract to a named constant on the 2nd use — same reasoning, this isn't really about line count |
| Pure styling / layout boilerplate | `.padding(.horizontal, 16)`, a bare `Spacer()`, short wrapper JSX | Never extract based on repetition alone — this is framework noise, not logic, no matter how many times it repeats |

**Fallback-chain readability (separate concern, not duplication):** when a single function has several optional fallbacks feeding one output (e.g. `content.title ?? content.name ?? ""`), collapse into one named local variable for readability. This is a single-function clarity improvement, not a cross-function dedup — don't confuse the two.

### Don't extract on the first occurrence

Wait for real repetition before extracting. A function written to be "reusable" after seeing only one caller is really just guessing at the shared shape from incomplete information — the first caller's incidental details (a specific default, a specific unwrap style) get baked in as if they were requirements. When the second real caller doesn't quite fit, you either bloat the function with flags or duplicate anyway, ending up worse off than if you'd waited.

## Part 2: File & folder structure

### No whole-feature-in-one-file

Don't put an entire feature's state, view layout, subviews, and event handlers into a single file just because it's fast to write. Split by **responsibility** — see `references/swift-swiftui.md` and `references/react-native-expo.md` for the concrete per-stack conventions and examples.

The splitting axis is *responsibility*, never an arbitrary line-count target. A file being long is not itself a reason to split it — see the next section.

### When a file is "one responsibility" but very long

Long files should get a hard look, but the fix isn't automatically "split it up" — sometimes it's "make it more navigable in place." Work through this in order:

1. **Check whether it's really one responsibility, or several wearing one coat.** A long function that branches into many cases (e.g. rendering N different content types based on a type field) often has real seams hiding inside it — split by variant/case, by lifecycle phase (state/setup vs. rendering vs. actions), or by data domain, whichever seam is actually present. This is usually where the "one responsibility" claim breaks down on inspection.

2. **If it's genuinely atomic and still long** (one algorithm, one state machine, one parser that doesn't decompose without hurting readability): don't force a file split just to hit a number. Instead extract **internal structure** — private helper functions within the same file, clearly labeled sections (`// MARK: -` in Swift or equivalent) — so the file stays long but is easy to navigate top-to-bottom.

3. **Only create a new file when a chunk can stand alone** and be understood without needing the rest of the file open at the same time — apply the same "does this need to change together?" test from Part 1, just applied to sections of a file instead of duplicate code blocks.

Note: mechanical line-count ceilings (e.g. "flag anything over 1500 lines") are better enforced by a linter (SwiftLint's `file_length`, ESLint equivalents, etc.) than decided here. This skill governs *how* to respond once something is flagged long, not *whether* to flag it.

## Part 3: Where reusable code lives

**Default to feature-scoped, not global.** When something is extracted, it should stay inside the feature it came from unless a second, genuinely unrelated feature also needs it — that's a manual decision the user makes, not something to do automatically on spotting a second similar-looking use elsewhere.

- Feature-scoped extraction → lives in a feature-scoped helper file, e.g. `{FeatureName}+Helpers.swift` — same naming convention as the responsibility-split files from Part 2 (`{FeatureName}+CardViews.swift`, `{FeatureName}+ViewBuilders.swift`, etc.).
- Only promote to a shared/common location (e.g. a project-wide `Utils/` or `shared/`) when a second unrelated feature needs the same thing — and even then, this is worth surfacing to the user as a suggestion rather than doing silently, since promoting scope is a bigger structural decision than extracting a function.

**Name for discoverability.** A reusable function nobody can find gets re-duplicated anyway. Name it after *what it does*, not where it came from or when it was written. If the name needs a comment to explain what it's for, the name is wrong. Compare: `isDetailEmpty(_:)` (clear from the name alone) vs. something like `checkContentHelper2` (meaningless without opening the function).

## Stack-specific references

These conventions genuinely don't transfer between stacks — read the one that matches the current project before applying Part 2's structure guidance:

- `references/swift-swiftui.md` — Swift / SwiftUI file-splitting conventions, extension patterns, what counts as non-extractable boilerplate
- `references/react-native-expo.md` — React Native / Expo conventions (component/hook/style splitting)

If working in a stack not covered by these references, apply the framework-agnostic principles from Parts 1-3 directly, and ask the user if there's an existing convention in the codebase to follow before inventing a new one.
