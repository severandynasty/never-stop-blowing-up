# Development Process

This document defines a proposed draft process for safe, specification-oriented, AI-assisted development in this repository. It describes how work should be performed once supporting specifications and tooling exist; it does not claim those tools are already present.

## Current Development Model

The repository currently has:

- Direct Foundry ES module development
- Hand-authored actor and item templates
- Hand-authored CSS
- CSV content sources
- Generated NeDB-style item compendium files
- Hand-maintained journal compendium JSON
- One Node build script
- A manual installation path based on `system.json`
- Vitest with a framework sample and injury-cost tests using mocked Foundry globals

There is currently no Foundry-world integration test suite, CI workflow, lint configuration, or Foundry browser harness.

## Development Goals

Future development should optimize for:

- Executable specifications
- Small, reviewable diffs
- Deterministic builds
- Stable Foundry document IDs
- Safe autonomous implementation
- Automated validation
- Explicit migration planning
- Reproducible Foundry testing
- Clear separation of gameplay rules from UI code

## Source-of-Truth Rules

When representations conflict, identify the intended source of truth before changing files.

Current candidate sources:

| Concern | Preferred current source |
|---|---|
| Actor and item field names | `template.json` and runtime usage in `scripts/nsbu.js` |
| Foundry manifest and packs | `system.json` |
| Individual ability content | `game_data/abilities.csv` |
| Group-ability content | `game_data/group_abilities.csv` |
| Runtime behavior | `scripts/nsbu.js`, templates, and Foundry hooks |
| Sheet layout | Templates plus `styles/styles.css` |
| Rules prose | `game_data/game_rules.md` |
| Foundry usage prose | `game_data/system_guide.md` |
| Generated item packs | Output of `scripts/build-compendiums.js` |

No source should be treated as sufficient to silently override another when they describe conflicting behavior.

## Work Types

### Gameplay Rule Change

Gameplay work must identify the rule contract before implementation.

Required sequence:

1. Read the relevant rule documentation.
2. Locate the implementation in `scripts/nsbu.js`.
3. State the existing behavior and proposed behavior.
4. Add or update a mechanical specification.
5. Add focused tests for the rule.
6. Update runtime code only after a testable design exists.
7. Verify actor, chat, and sheet effects.
8. Update directly related documentation.

Examples:

- Blow-up threshold changes
- Injury cost changes
- d20/d100 continuation changes
- Track Restart changes
- Episode reset behavior

### Foundry Integration Change

Foundry integration work should include:

- Lifecycle-hook stage
- Actor or item document impact
- Ownership and permissions impact
- Sheet template impact
- Chat message impact
- Reconnect or stale-control considerations

The smallest test should cover behavior when no Foundry browser is required. Integration work should include a documented manual or automated Foundry smoke test for browser-specific behavior.

### Compendium Change

For CSV-backed abilities:

1. Edit the relevant CSV source.
2. Update generated `.db` content through the build script.
3. Verify entry counts.
4. Verify asset paths.
5. Verify stable `_id` values.
6. Review the generated diff.

Do not hand-edit generated ability packs when the build script can generate the intended result.

Journal pack changes require source and manifest review until journal generation is formalized.

### UI or Styling Change

UI work should state:

- Which sheet or chat component is affected
- Which foundry or browser classes are involved
- Whether actor data changes
- Whether chat message data changes

At minimum, visual review should cover character, NPC, item, and group-ability contexts that share relevant styles.

### Documentation-Only Change

Documentation-only work must not modify runtime code or generated packs.

It must:

- Reconcile stale counts
- Preserve repository-relative or absolute workspace references appropriately
- State whether it describes current behavior or a proposed state
- Avoid implying that unimplemented tests or automation exist

## Specification Format

Future specifications should be:

- Executable wherever practical
- Deterministic
- Based on observable behavior
- Independent of UI markup when testing rules
- Explicit about edge cases

Recommended structure:

```text
specs/
  mechanics/
  foundry/
  compendiums/
  schemas/
tests/
  unit/
  integration/
  foundry/
```

A mechanical specification should define:

- Inputs
- Initial actor state
- Dice behavior
- Token behavior
- Injury behavior
- State mutation
- Chat output
- Final actor state

Example:

```text
Given a d6 Weapon roll of 5
And 1 available Turbo Token
And injury level 0
When the player adds 1 Token
Then the result is 6
And the Weapon stat advances to d8
And the Token pool decreases by 1
And episode spending increases by 1
```

Use concrete values rather than vague statements such as “roll may blow up.”

## Recommended Testing Layers

### Pure Rule Tests

Test calculations without Foundry or browser dependencies:

- Die selection
- Natural maxima
- Token-assisted maxima
- Cumulative totals
- Injury-adjusted costs
- Token affordability
- d20/d100 selection
- Track Restart highest-die result
- Stat progression

These tests should be runnable in Node.

### Foundry Integration Tests

Test persisted document behavior:

- Actor updates
- Chat message updates
- Ownership controls
- Hook timing
- Sheet save behavior
- Item drop behavior
- Compendium loading
- World-setting behavior

A Foundry test world or injected Foundry adapters are required for reliable integration coverage.

### Browser Smoke Tests

Exercise the visible workflows:

- Create character
- Create NPC
- Toggle edit mode
- Increase and decrease dice
- Add, remove, and refresh Tokens
- Apply injuries
- Start a New Episode
- Roll and accept
- Roll and blow up
- Add Tokens through the chat UI
- Use d20 or d100 continuation
- Drag an ability onto an actor

Browser tests should verify that no JavaScript error or inconsistent chat update occurs.

### Content Validation

Validate:

- CSV parsing
- Compendium entry counts
- Source/build parity
- Stable IDs
- Required fields
- Missing or broken icons
- Manifest paths
- Package and system versions
- Journal pack presence
- Relative documentation links
- JSON syntax

## Safe Implementation Loop

Every implementation task should follow this loop:

1. Read the relevant repository files.
2. Identify the requested behavior and existing behavior.
3. State any ambiguous assumptions before implementation.
4. Limit the diff to directly related files.
5. Add or update a specification.
6. Add a focused test or explicit validation command.
7. Implement the smallest complete change.
8. Run targeted validation.
9. Inspect the diff for unrelated and generated changes.
10. Run broader validation after cross-cutting edits.
11. Report unverified Foundry behavior.

Do not attempt to compensate for missing specifications through multiple speculative implementations.

## Agent Task Template

Future AI agent tasks should include:

```text
Goal:
Current behavior:
Requested behavior:
Relevant files:
Out of scope:
Specification:
Validation commands:
Migration or compatibility impact:
Generated files:
Manual Foundry verification:
Acceptance criteria:
```

The task should avoid asking an agent to “modernize” an entire subsystem without measurable boundaries.

## Copilot Repository Guidance

When GitHub Copilot repository instructions are added, they should require agents to:

- Read relevant specifications before changing code
- Keep gameplay code unchanged for documentation-only work
- Search for duplicate implementations before adding another
- Preserve existing actor data paths unless a migration is part of the task
- Avoid regenerated compendium IDs
- Test pure behavior separately from Foundry UI behavior
- Report assumptions explicitly
- Run the smallest applicable validation command first
- Expand validation only when the change crosses modules
- Not publish or release automatically
- Not change a Foundry world or user data

Future prompt files should be narrowly scoped. A task for one roll mechanic should not simultaneously request an application migration or a full compendium rewrite.

## Branch and Review Practices

Until repository automation is established, use a branch for each coherent change.

Suggested branch categories:

- `spec/<topic>`
- `test/<topic>`
- `fix/<topic>`
- `refactor/<topic>`
- `docs/<topic>`
- `content/<topic>`
- `foundry/<topic>`

Pull requests should explain:

- What changed
- What behavior remains unchanged
- Which specifications or tests cover the change
- Which actor fields or chat data changed
- Which compendiums were rebuilt
- Which migrations are required
- Which Foundry versions were tested
- What remains unverified

Large changes should be divided into reviewable stages:

1. Specification
2. Tests
3. Pure implementation
4. Foundry integration
5. Documentation
6. Compendium generation
7. Release

## Current Validation Commands

The repository currently provides:

```powershell
npm test
npm run build-compendiums
npm run build
npm run rebuild
```

`npm test` runs Vitest through `vitest run`.

The repository has no lint script or Foundry-world integration test command yet.

Future validation must add explicit commands, for example:

```text
npm run validate
npm run test:unit
npm run test:integration
npm run test:foundry
npm run build:check
```

Those commands should not be introduced in a documentation-only task.

## Safe Refactor Sequence

Before extracting or replacing a gameplay subsystem:

1. Capture current behavior in specifications.
2. Add tests or a Foundry comparison fixture.
3. Extract pure calculations.
4. Add narrow adapters for Foundry actors and chat.
5. Preserve old chat and sheet outputs where behavior has not changed.
6. Replace one code path at a time.
7. Retain a rollback point.
8. Remove duplicated code only after tests cover it.

Do not begin an application framework migration or a full rewrite before mechanical behavior is executable and reviewable.

## Migration Policy

Before changing actor or item schemas:

- Identify every persisted field and lookup key.
- Search templates, runtime code, and compendiums.
- Create an explicit migration for existing worlds.
- Preserve old fields until migration success is confirmed.
- Provide a dry-run or validation check.
- Document manual rollback and recovery.
- Avoid automatically overwriting user-created data.
- Test migrated actors and items in a Foundry test world.

Until migrations exist, schema changes should be isolated and documented.

## Autonomous Implementation Boundaries

An AI agent may implement a scoped change autonomously when:

- The requirement is explicit
- Relevant specifications exist or can be added safely
- Tests or validation cover the result
- The diff is limited to known files
- No destructive reset or unrelated cleanup is needed
- No data migration is implicit
- No secret or external publishing operation is required

An AI agent should stop and request direction when:

- The rule is ambiguous
- Player and GM behavior conflict
- Persistent schema changes affect existing worlds
- A compendium `_id` or icon path is unknown
- Foundry compatibility is uncertain
- A change could publish or distribute copyrighted or licensed content
- The repository has no test capable of distinguishing correct behavior
- Existing documentation conflicts with executable code

## Definition of Done

A change is complete only when:

- The requested behavior is implemented
- No unrequested gameplay behavior changed
- Directly related documentation is current
- Source and generated content are consistent
- Tests or validation cover the change
- The diff is scoped and reviewable
- Foundry-specific behavior is verified or explicitly unverified
- Migration and compatibility impact is stated
