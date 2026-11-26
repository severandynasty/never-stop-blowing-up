# Architecture

This document describes the current repository as it exists. It is a draft intended to guide future AI-assisted development. It describes observed behavior; it is not a proposal to change that behavior.

## System Overview

Never Stop Blowing Up is a custom Foundry Virtual Tabletop game system. It provides:

- Character and NPC actor sheets
- Ability and group-ability item sheets
- Interactive exploding-dice rolls in Foundry chat
- Turbo Token and injury tracking
- Character, NPC, and item data templates
- Player, rules, and system-guide compendiums
- A Node.js compendium build script
- Static SVG and PNG assets

The browser/runtime implementation is written as Foundry ES module code in `scripts/nsbu.js`. Node.js tooling currently consists primarily of `scripts/build-compendiums.js`.

## Repository Layout

```text
assets/                         Dice images and ability SVG artwork
game_data/                      Editable source content
  abilities.csv                 Individual ability source rows
  group_abilities.csv           Group-ability source rows
  game_rules.md                 Rules reference source
  system_guide.md               Foundry usage source
lang/
  en.json                       English localization strings
packs/
  abilities.db                  Foundry individual-ability compendium
  group-abilities.db            Foundry group-ability compendium
  rules-reference.db            Foundry rules JournalEntry pack
  system-guide.db               Foundry system-guide JournalEntry pack
scripts/
  nsbu.js                       Main Foundry runtime module
  build-compendiums.js          CSV-to-compendium build script
  rules/
    injury-adjusted-token-cost.js Pure injury-adjusted Token calculation
tests/
  framework.test.js             Vitest framework verification
  injury-adjusted-token-cost.test.js  Injury cost and mocked roll handler tests
styles/
  styles.css                    Foundry sheet and UI styling
templates/
  actor-sheet.html              Character sheet template
  npc-sheet.html                NPC sheet template
  item-sheet.html               Ability and upgrade item template
  group-ability-sheet.html      Group-ability item template
package.json                    Node package metadata and build commands
system.json                     Foundry system manifest
template.json                   Foundry Actor and Item template defaults
vitest.config.js                Node-environment Vitest configuration
readme.md                       Installation and user overview
License.txt                     Repository license
```

## Test Setup

The repository now includes Vitest as a development dependency.

- `package.json` defines `npm test` as `vitest run`
- `vitest.config.js` selects the Node test environment
- `tests/framework.test.js` provides a framework-only sample test
- `tests/injury-adjusted-token-cost.test.js` tests the existing injury-cost helper and selected combined roll-handler behavior with mocked Foundry globals

The injury tests load the runtime in an isolated Node context; they do not run in a Foundry world or browser.

The injury-adjusted Token calculation is also imported directly from `scripts/rules/injury-adjusted-token-cost.js`. It contains no Foundry dependencies; its callers remain in the Foundry runtime module.

## Foundry Entry Points

`system.json` is the authoritative Foundry package manifest. It declares:

- ES module entry point: `scripts/nsbu.js`
- System stylesheet: `styles/styles.css`
- Actor types `character` and `npc`
- Item types `ability`, `upgrade`, and `group-ability`
- World settings
- English localization
- Four compendium packs
- Foundry compatibility range: minimum `12`, verified `12.343`, maximum `12`

The module uses Foundry lifecycle hooks:

- `init`: registers world settings and the Handlebars `stripSortPrefix` helper
- `setup`: registers sheets and inspects available packs
- `ready`: restores Track Restart state and installs delegated global chat handlers
- `renderChatMessage`: controls roll-result visibility by actor ownership
- `preUpdateActor`: synchronizes Track Restart runtime state with persisted actor updates

## Runtime Architecture

### Main Module

`scripts/nsbu.js` is currently the central runtime module. It combines:

- Foundry initialization and settings
- Sheet registration
- Character and NPC sheet behavior
- Item sheet behavior
- Global document event handlers
- Interactive roll creation
- Exploding-die progression
- d20 and d100 continuation behavior
- Turbo Token spending
- Injury-adjusted Token costs
- Track Restart state
- Roll sequence state
- Chat result rendering and updates
- Drag-and-drop item creation
- Debug logging

The file is approximately 2,580 lines and is effectively the current runtime monolith.

### Actor Model

`template.json` defines two actor types.

Character actors contain:

- Character identity fields
- Nine die-valued stats
- Persistent Track Restart flags
- Hit points
- Boom level
- Injuries
- Turbo Tokens
- Episode-spending total
- Ability and group-ability lists
- Inventory and biography

NPC actors contain a reduced subset: identity fields, nine stats, hit points, boom level, injuries, Turbo Tokens, episode-spending total, abilities, group abilities, and notes.

The runtime expects actor data at paths below `system`, for example `system.stats.weapons` and `system.turboTokens`.

### Sheet Architecture

`NSBUActorSheet` implements the character sheet and `NSBUNPCSheet` implements the NPC sheet. Both extend Foundry's `ActorSheet`.

Current shared responsibilities include:

- Stat die increase and decrease
- Turbo Token increase and decrease
- Injury increase and decrease
- New Episode reset
- Ability removal
- Stat roll initiation
- Edit Mode toggle
- Portrait selection
- Form input persistence
- Item drop handling

Character and NPC sheet implementations duplicate much of this behavior. Their templates are also separate and contain repeated die/icon markup for each of the nine stats.

`NSBUItemSheet` is used for ability and upgrade items. `NSBUGroupAbilitySheet` is used for group abilities.

## Dice and Roll Architecture

The interactive dice flow begins when a `.stat-roll` button is clicked.

`createInteractiveDiceRoll(actor, stat, statValue, cumulativeTotal, rollSequenceId)`:

1. Starts or cancels a roll sequence for an actor/stat pair.
2. Rolls a single die or a two-die Track Restart roll.
3. Keeps the highest result for Track Restart advantage.
4. Adds the result to a cumulative total.
5. Creates a Foundry `Roll` and chat message.
6. Detects natural maxima.
7. Progresses the stat die after a blow-up.
8. Continues the sequence until the player accepts or the roll ends.

Die progression is:

```text
d4 -> d6 -> d8 -> d10 -> d12 -> d20
```

At d20, the configured `d20BlowUpDie` world setting determines whether continued blow-ups use repeated d20 rolls or d100:

- `d20`: continue rolling d20
- `d100`: roll d100 for continued blow-ups

The flow distinguishes:

- Natural maximum blow-ups
- Turbo Token-assisted blow-ups
- Accepted rolls
- Cancelled rolls
- Auto-blow-up actions
- Maximum-die continuation

Roll UI controls are represented in chat HTML and handled by global delegated jQuery events. Controls are shown for users who own the actor and hidden for observers.

## State Management

Persistent state is stored on Foundry documents:

- Actor system fields are persisted through `actor.update(...)`
- Embedded ability items are persisted through `createEmbeddedDocuments(...)`
- Roll messages are persisted through `ChatMessage.update(...)`
- World settings are registered through `game.settings`

Runtime-only state is held in module Maps:

- `activeRollSequences`: unfinished actor/stat roll chains
- `rollSequenceTimeouts`: cleanup timers for abandoned chains
- `trackRestartStates`: active Track Restart advantages

Active roll sequences are cleared after acceptance, cancellation, timeout, or successful non-blow-up completion. Track Restart state is restored from actor data when Foundry is ready and updated from `preUpdateActor`.

Runtime-only Maps are process-local and are not an actor, chat, or Foundry document data model.

## Turbo Tokens and Injuries

Turbo Tokens are persisted on actors in `system.turboTokens`.

Episode spending is persisted in `system.tokensSpentThisEpisode`.

Injury levels are numeric values from `0` to `3`:

- Levels `0-1`: token cost ratio `1:1`
- Levels `2-3`: token cost ratio `2:1`

The injury at level `3` (Adrenalized) adds 10 Turbo Tokens once the actor reaches that level.

Starting a new episode resets:

- `system.turboTokens`
- `system.tokensSpentThisEpisode`

It does not reset injuries.

The UI refreshes actor-owned token counts after another actor or manual sheet action changes the token pool.

## Content Pipeline

Editable content sources are stored in `game_data/`.

For individual abilities:

1. CSV rows are read from `game_data/abilities.csv`.
2. Names are converted to slug-style icon paths.
3. Entries are mapped to item objects.
4. JSON-lines are written to `packs/abilities.db`.

For group abilities:

1. CSV rows are read from `game_data/group_abilities.csv`.
2. Group suite and die requirements are parsed from parenthetical text.
3. Rows are sorted by die tier and suite.
4. Entries are mapped to `group-ability` item objects.
5. JSON-lines are written to `packs/group-abilities.db`.

The build script is exposed through:

```powershell
npm run build-compendiums
npm run build
npm run rebuild
```

Both item build functions generate UUID-based `_id` values. The script does not currently rebuild the rules and system-guide journal packs.

The CSV and generated pack directories are both committed. Future work should treat generated packs consistently and validate source-to-pack parity.

## Compendiums

The manifest declares:

| Pack | Type | Path | Purpose |
|---|---|---|---|
| abilities | Item | `packs/abilities.db` | Individual player abilities |
| group-abilities | Item | `packs/group-abilities.db` | Team/group abilities |
| rules-reference | JournalEntry | `packs/rules-reference.db` | Core rules |
| system-guide | JournalEntry | `packs/system-guide.db` | Foundry usage guide |

Ability entries point to SVG artwork under `assets/abilities/`.

Group-ability entries point to SVG artwork under `assets/individual-group-abilities/`.

The journal compendiums contain prebuilt Foundry document JSON rather than being generated from Markdown at build time.

## Styling

`styles/styles.css` provides:

- The NSBU sheet color theme
- Global actor-sheet overrides
- Stat and dice presentation
- Edit Mode appearance
- Injury status colors
- Token and episode controls
- Responsive layout rules

Some styling uses `!important` and broad wildcard selectors to override Foundry's default application styles.

## Known Architectural Boundaries

The following boundaries are important for future work:

1. Most gameplay rules remain implementation details of `scripts/nsbu.js`; injury-adjusted Token cost is extracted to `scripts/rules/injury-adjusted-token-cost.js`.
2. No general rules layer exists; the injury-cost module is a focused extraction.
3. No custom Foundry `Actor` or `Item` document class exists.
4. No Foundry data-model migration system exists.
5. Injury-cost tests exist, but there is no Foundry-world or browser integration test suite.
6. No repository CI exists.
7. Chat HTML is generated by the runtime and manipulated through jQuery.
8. Most roll and token state is actor/chat data plus process-local Maps.
9. Character and NPC sheets contain duplicated behavior.
10. Source content and generated pack files are maintained in separate representations.

Future changes should not assume these boundaries are ideal; they are a description of the current implementation.
