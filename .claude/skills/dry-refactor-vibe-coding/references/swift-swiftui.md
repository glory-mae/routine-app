# Swift / SwiftUI — File Structure & Reuse Conventions

## File-splitting pattern

Split a SwiftUI feature view into a core file plus responsibility-based extensions, all in the same conceptual "group" (Xcode group / folder), sharing the type name as a prefix:

```
NCxAIContentDetailView.swift              — core: properties, @State, init, body
NCxAIContentDetailView+CardViews.swift     — the individual card-building functions
NCxAIContentDetailView+ViewBuilders.swift  — @ViewBuilder functions that assemble rows/sections
NCxAIContentDetailView+TapHandlers.swift   — action/event handler functions (button taps, navigation triggers)
```

This is a real, working example — it's the actual convention already in use in this codebase (see `NCxAIContentDetailView.swift` and its `+CardViews` / `+ViewBuilders` siblings). Use `extension TypeName { ... }` in each file to add the relevant functions/computed properties to the main view type.

**How to decide which extension a new function goes in:**
- Builds and returns a `some View` for a specific card/cell type → `+CardViews`
- Builds and returns a `some View` that assembles/switches between other views (rows, sections, conditional layout) → `+ViewBuilders`
- Runs in response to a user action, no view returned (navigation, network trigger, notification post) → `+TapHandlers`
- Core view state, `@State`/`@StateObject` properties, `init`, and `body` itself → the base file, kept minimal

If a new kind of function doesn't fit the existing extension categories, it's fine to add a new one (e.g. `+Formatters`, `+Networking`) rather than force it into an ill-fitting bucket — but check the file naming stays consistent (`TypeName+ResponsibilityName.swift`).

## Reusable-logic placement

- Feature-scoped reusable code → its own extension file following the same convention, e.g. `NCxAITop+Helpers.swift`, scoped to that feature only.
- Don't reach for a project-wide `Utils.swift` or global extension by default — a helper used only inside `NCxAITop` belongs in `NCxAITop+Helpers.swift`, not a shared file, even if something similarly named exists elsewhere in the app.
- A verbatim-repeated concept/definition is often best expressed as a **computed property or small extension on the model itself**, rather than a free function — e.g. an "is in progress" check reads better as `extension ContentItem { var isInProgress: Bool { progressPercent > 0 && progressPercent < 100 } }` than as a free-floating helper function taking an `Int`. This also makes it discoverable via autocomplete on the model type, which solves the "can anyone find this" problem for free.

## What NOT to extract (non-extractable boilerplate)

SwiftUI modifier chains repeat constantly and are not duplication in the meaningful sense — don't extract these based on repeat count alone:

```swift
.padding(.horizontal, 16)
.padding(.bottom, 16)
.foregroundColor(NCxAITheme.primaryText)
Spacer()
```

These are layout/styling noise, not logic. If a *specific combination* of modifiers represents a genuinely reusable visual style used across many views (e.g. a consistent "card shadow" look), a `ViewModifier` or a small wrapper view can be worth it — but that's a design-system decision, not something to do reactively just because a `.padding()` call shows up several times.

## Real example from this codebase: what correctly stayed separate

`getContentItemCard(item:contentKey:)` and `getTrainingCard(training:contentKey:)` in `NCxAIContentDetailView+CardViews.swift` build near-identical-looking `NCxAISubcontentCardView`s from two different model types (`ContentItem` fields accessed differently: `item.displayName` vs `training.contentTitle`, different optionality on `difficulty`/`duration`). These were kept as two separate functions rather than merged into one parameterized function — this is correct, not a missed refactor, because the two model shapes diverge and merging them would just move the divergence into extra parameters at the call site.

## Real example: what's a good extraction candidate

The default thumbnail fallback string `"https://example.com/default-thumbnail.png"` appears multiple times across card-building functions in the same file. This is a magic literal, not a logic difference — a good candidate for a `static let` constant (e.g. on a `NCxAISubcontentCardView` extension or a feature-scoped constants file), so a future change to the placeholder only needs to happen once.

## Long single-responsibility files in SwiftUI

A `switch`/`if-else` view-builder function that branches across many content types (e.g. `getDetailView(for:)` handling live lessons, news, Callan stages, training, study abroad videos, blog posts, NC Square, generic items) can get long while still being "one function." Before splitting into more files:
- Check if each branch is really independent enough to be its own small `@ViewBuilder` function (it usually is — this is what `getSpeakingTestCard`, `getCallanReadingCard`, etc. already demonstrate as a pattern).
- Use `// MARK: -` to break up long files/functions into navigable sections even without changing file count.
- Only pull a branch into a wholly separate `+ExtensionFile.swift` if it has enough surrounding logic (multiple helper functions, non-trivial state) to justify being its own unit — a single `case` in a switch usually doesn't.
