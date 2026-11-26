# Coding Standards

This draft is intended for contributors and AI-assisted development. It is based on the repository's current conventions and identifies areas that should be preserved or safely modernized.

## Scope

These standards apply to repository work involving:

- Foundry runtime JavaScript
- Character and NPC sheets
- Items and compendiums
- Templates and styles
- Build scripts
- Documentation
- Tests and validation added in the future

Gameplay code in `scripts/nsbu.js` should be modified only when explicitly requested. Documentation-only changes must not alter gameplay behavior.

## General Principles

1. Prefer the smallest complete change.
2. Preserve existing user-visible behavior unless a change explicitly asks for a behavior change.
3. Keep changes reversible and reviewable.
4. Do not infer or change rules that are not specified.
5. Separate pure rule calculations from Foundry UI and document APIs.
6. Treat Foundry actors, items, settings, and chat messages as persistent state.
7. Reuse existing names and data paths unless migrating them intentionally.
8. Validate content and behavior instead of relying only on successful JavaScript execution.
9. Do not regenerate unrelated compendium entries or assets.
10. Report assumptions, limitations, and untested Foundry behavior.

## JavaScript Style

The existing runtime uses modern ES module JavaScript and semicolon-terminated statements. Follow existing local style unless a modernization task explicitly introduces a formatter or module convention.

### Naming

- Use descriptive camelCase names for variables and functions.
- Use the existing stat names: `weapons`, `brawl`, `hot`, `drive`, `stunts`, `wits`, `tech`, `tough`, and `sneak`.
- Use die values as numbers: `4`, `6`, `8`, `10`, `12`, `20`, and optionally `100`.
- Preserve Foundry data paths such as `system.stats.<stat>` and `system.turboTokens`.
- Prefix event namespaces with `nsbu-`, as in `click.nsbu-accept`.

Examples of established names:

- `createInteractiveDiceRoll`
- `getInjuryAdjustedTokenInfo`
- `clearRollSequence`
- `activeRollSequences`
- `trackRestartStates`

### Functions

- Keep functions focused on one operation.
- Pure calculations should not mutate actors or the DOM.
- Foundry document updates should be explicit and named.
- Check for missing or invalid actor data before accessing nested properties.
- Prefer existing fallbacks for legacy actors only when they preserve current behavior.
- Avoid adding another global mutable state Map unless required and designed to persist or synchronize safely.

### Async Behavior

- Await actor and chat updates before starting dependent operations.
- Guard against duplicate clicks with explicit processing state.
- Do not use timeouts as the primary state synchronization mechanism.
- Preserve ownership checks before token or roll mutations.
- Consider idempotency before mutating persistent state.
- Log failures clearly; do not silently continue after an actor or chat update fails.

### Debugging

- Use `debugLog(...)` for runtime diagnostics that should be gated by the `enableDebugLogging` setting.
- Keep unrelated console startup information out of gameplay code changes.
- Do not log actor data, tokens, or player identity unless necessary and explicitly approved.
- Use `console.error` for real failures and `ui.notifications` for actionable player-facing errors.

## Foundry Conventions

### Hooks

- Register initialization behavior in the appropriate Foundry lifecycle hook.
- Use `Hooks.once('init')` for settings and registration that must happen once.
- Use `Hooks.once('setup')` for sheet registration.
- Use `Hooks.once('ready')` for process-local state restoration.
- Use `Hooks.on('renderChatMessage')` for chat UI synchronization.

Do not assume a hook has run in code that executes during an earlier lifecycle stage.

### Actor and Item Updates

Use flattened Foundry update keys when updating nested fields:

```javascript
await actor.update({
  [`system.stats.${stat}`]: newDie
});
```

When updating multiple fields that must remain consistent, prepare the complete update object before one `actor.update(...)` call.

Examples of fields to update together:

- Turbo Tokens and episode-spending total
- Injury level and Adrenalized bonus Tokens
- Track Restart flag and stat reset

Future refactors should add transaction or compare-and-refresh logic rather than relying on unchecked repeated reads.

### Ownership

- Verify `actor.isOwner` before exposing mutating roll controls or executing actor mutations.
- The chat visibility hook should not be the only ownership check.
- Preserve the existing behavior that observers see the waiting message instead of mutating controls.
- Do not trust a DOM `data-actor-id` value as authorization.

### Sheets

- Call `super.activateListeners(html)` where the existing class does.
- Preserve the `.edit-controlled` read-only behavior.
- Maintain the character-only `system.player` field and the NPC-specific template differences.
- Keep sheet width and height changes limited to intentional UX work.
- Remove ability items by item ID through `this.actor.items`.

### Rolls

- Use Foundry `Roll` rather than replacing roll evaluation with `Math.random`.
- Preserve natural maximum and blow-up behavior unless the specification changes.
- Track cumulative totals consistently across chained rolls.
- Use the same die progression array everywhere.
- Validate that a stat resolves to a supported die before rolling.
- Preserve d20/d100 world-setting behavior.

## Templates and Handlebars

- Keep templates declarative.
- Use existing Handlebars helpers and block syntax.
- Display the actor or item name with the existing fallback behavior.
- Use `system.originalName` for group abilities when it is present.
- Preserve the sort-prefix helper behavior for group item names.
- Escape or safely render dynamic text where Foundry's text engine does not do it.
- Do not add inline script tags or inline event handlers.
- Keep templates compatible with the legacy Foundry Handlebars environment.

## HTML and Chat Content

Chat UI currently uses generated HTML stored in `ChatMessage.content`.

For future changes:

- Centralize HTML generation in a dedicated renderer.
- Escape interpolated names and data.
- Avoid adding arbitrary HTML from actor fields.
- Prefer small data fields and stable CSS classes.
- Reuse existing NSBU CSS class names such as:
  - `nsbu-roll-result`
  - `roll-details`
  - `roll-controls`
  - `roll-observer`
  - `blow-up-notice`
  - `final-result`
- Update chat message content only after a corresponding local state mutation succeeds.

## CSS

- Preserve the NSBU visual theme unless a UI task changes it.
- Scope new styles under `.actor-sheet.nsbu-sheet` or a dedicated NSBU root.
- Avoid broad `*` selectors except where matching existing Foundry override behavior.
- Use `!important` only when Foundry's base styles demonstrably require it.
- Prefer classes over inline styles for maintainable changes.
- Preserve injury status colors and edit-mode state visuals.
- Verify changes against character, NPC, item, and chat contexts.

## Data and Compendium Standards

### Source of Truth

The repository currently has multiple representations:

- CSV files for individual and group abilities
- `.db` files for generated item compendiums
- Markdown for rules and usage documentation
- Generated journal `.db` files
- Templates for actor and item defaults

Do not silently change one representation without identifying related representations.

### IDs

- Preserve existing compendium IDs unless intentionally migrating data.
- Do not regenerate every UUID on each build.
- Report any `_id` changes because they may affect existing worlds.

### Assets

- Ability icons use `assets/abilities/<slug>.svg`.
- Individual group-ability icons use `assets/individual-group-abilities/<slug>.svg`.
- Dice icons use `assets/dice/d4.png` through `assets/dice/d20.png`.
- Preserve asset paths in item data unless a migration updates every reference.
- Check that a source row has a corresponding icon before publishing changes.

### CSV

- Keep headers stable:
  - `Ability Name,Effect`
  - `Group Suite,Ability Name,Effect`
- Quote fields containing commas.
- Preserve the CSV quote-escaping rules in the build script.
- Trim or validate fields consistently rather than silently dropping malformed rows.

### Generated Files

- Build scripts may update generated compendium `.db` files.
- Source data must be changed rather than hand-editing generated files when the build script supports the source.
- Existing generated journal data is not currently produced from Markdown.
- Generated and source files must be reviewed together.

## Documentation

- Keep documentation factual and tied to repository behavior.
- Update directly related documentation for user-visible changes.
- Resolve count inconsistencies rather than copying stale numbers.
- Use clear Windows-compatible repository paths in internal guidance.
- Do not describe proposed architecture as existing behavior.
- Label migration or modernization proposals separately from current behavior.

## Change Boundaries

### Gameplay Changes

Before changing gameplay:

1. Identify the affected rule.
2. Locate every implementation surface.
3. Add or update executable specifications.
4. Add focused tests when a test harness exists.
5. Verify actor updates and chat output.
6. Verify PC and NPC behavior where shared code is affected.

### Compendium Changes

Before changing compendium content:

1. Edit the source CSV or journal source.
2. Build or otherwise update generated packs.
3. Verify entry counts and IDs.
4. Verify icon paths.
5. Review generated diffs.

### UI and Styling Changes

- Scope styles to prevent Foundry-wide leakage.
- Verify character, NPC, item, and group-ability sheets.
- Verify chat controls and injury warnings.
- Avoid changing data behavior while adjusting presentation.

### No-Modification Documentation Tasks

Documentation-only work must not:

- Modify runtime JavaScript
- Modify templates or styles
- Rebuild packs
- Change actor or item data
- Change manifest compatibility

## Validation Expectations

Before adding a new test or validation system, use the repository's smallest existing command.

Current commands:

```powershell
npm test
npm run build
```

Vitest is configured for the Node environment. Add gameplay unit tests only after extracting or isolating behavior that can run without a live Foundry browser.

The repository has no established lint, Foundry integration-test, browser-test, or CI command. New tooling should not be invented or installed for a minimal task unless it is explicitly requested.

For every implemented change, state which behavior was validated and which Foundry behavior could not be run locally.
