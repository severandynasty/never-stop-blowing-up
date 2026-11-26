# Injury-Adjusted Turbo Token Cost Specification

This document describes the Turbo Token cost behavior that is implemented in the repository today.

It is based on `scripts/rules/injury-adjusted-token-cost.js`, its Foundry call sites in `scripts/nsbu.js`, and the actor sheet templates. It does not propose a redesigned rule.

## Scope

This specification covers:

- Injury levels and cost ratios
- Injury status display
- Roll-dialog token limits
- Combined accept/add-token behavior
- Auto-blow-up behavior
- Injury-related actor updates
- Existing edge cases and implementation mismatches

The authoritative cost calculation in the roll-dialog combined flow is `getInjuryAdjustedTokenInfo(actor, requestedTokens)`.

## Injury Levels

Both character and NPC sheets store an injury level at `system.injuries`.

The sheets render an injury input with:

- `min="0"`
- `max="3"`

However, the runtime input handler converts the entered value to a number and updates it without applying a numeric `0-3` clamp. The sheet's `+` and `-` controls do clamp within `0-3`.

The visible injury-status labels are:

| `system.injuries` | Status |
|---|---|
| `0` | Feelin' Fine |
| `1` | Superficial |
| `2` | Severe |
| `3` | Adrenalized |

NPC sheets have the Injury control but do not render the character-sheet injury-status label.

## Cost Ratio

The implementation calculates the ratio as follows:

```text
injuryLevel >= 2 -> 2:1
otherwise         -> 1:1
```

At injury levels `0` and `1`, one requested Turbo Token costs one actor Turbo Token.

At injury levels `2` and `3`, one requested Turbo Token costs two actor Turbo Tokens.

At injury levels greater than `3`, JavaScript still produces the `2:1` ratio because the condition is only `injuryLevel >= 2`.

At negative injury levels, the ratio is `1:1`.

An absent or nonnumeric injury value follows the implementation's JavaScript fallback/coercion behavior:

- `actor?.system?.injuries || 0` returns `0` for `0`, `null`, `undefined`, `false`, `NaN`, and an empty string
- A numeric string is coerced for the `>= 2` comparison
- A nonnumeric string does not meet `>= 2` and produces the `1:1` ratio

## Core Cost Calculation

`getInjuryAdjustedTokenInfo(actor, requestedTokens)` calculates:

```text
injuryLevel       = actor.system.injuries, or 0
tokenRatio        = 2 when injuryLevel >= 2, otherwise 1
actualCost        = requestedTokens * tokenRatio
availableTokens   = Number(actor.system.turboTokens), or 0
maxAffordableTokens = floor(availableTokens / tokenRatio)
canAfford         = actualCost <= availableTokens
```

The returned object contains:

- `injuryLevel`
- `tokenRatio`
- `actualCost`
- `availableTokens`
- `maxAffordableTokens`
- `canAfford`

### Numeric Edge Cases

- If `requestedTokens` is `NaN`, the combined flow normally prevents it because it uses `parseInt(...) || 0`.
- If `requestedTokens` is negative, the combined flow clamps it to `0` with `Math.max(0, parseInt(...) || 0)`.
- If `actor.system.turboTokens` is absent or `NaN`, `Number(...) || 0` converts it to `0`.
- If `actor.system.turboTokens` is negative, the value remains negative, `maxAffordableTokens` may be negative or zero, and a zero-token request can be unaffordable: `0 <= negativeAvailable` is false.
- If `availableTokens` is not an integer, `maxAffordableTokens` floors the division for injury-adjusted control limits.
- At injury level `2` or `3`, odd available pools leave a remainder:

  | Available | Requested limit |
  |---|---|
  | `1` | `0` |
  | `2` | `1` |
  | `3` | `1` |
  | `4` | `2` |
  | `5` | `2` |

  The remaining `1` token cannot pay for a whole additional requested/injured Token unit.

## Injury Warning

When a roll-dialog control is rendered:

- Injury level `0` or `1`: the injury warning is hidden
- Injury level `2` or `3`: an injury warning is shown

The warning text is:

```text
Injured! Tokens cost 2:1
```

The warning is initialized for roll messages at `renderChatMessage` time using `getInjuryAdjustedTokenInfo(actor, 0)`.

It is also updated when:

- The Token `+` button is used
- The Token input event fires
- The injury-adjusted roll state is recalculated

For valid injury levels greater than `3`, the cost code is `2:1`, but the UI warning condition is also `injuryLevel >= 2`, so it also shows `2:1`.

For negative or `0/1` injury levels, no warning is shown.

## Roll-Dialog Token Input

The roll-dialog Token input starts with:

- `min="0"`
- `max="<current actor Turbo Token pool>"`
- value `0`

The number input behavior is handled by the global `.token-input` listener.

### Plus Button

The plus button calculates:

```text
dieValue
currentDie
tokensNeededForBlowUp = currentDie - dieValue
currentRequestedToken = current input value
injuryInfo = getInjuryAdjustedTokenInfo(actor, currentRequestedToken + 1)
effectiveMax = min(
  maxAvailable,
  tokensNeededForBlowUp,
  injuryInfo.maxAffordableTokens
)
```

The plus button increments only if `current < effectiveMax`.

The plus button therefore limits the requested number of roll-input units by:

1. The raw value in the input's `max` attribute
2. The number needed to reach the current die maximum
3. The injury-adjusted maximum affordable requested units

It does not use the actual cost in the increment comparison. It uses the computed injury-adjusted floor.

If the current value cannot increment because it already meets `tokensNeededForBlowUp`, it shows:

```text
Maximum <n> tokens needed to blow up d<die> (save the rest for next roll!)
```

If the limit is the injury-adjusted affordability limit, it shows a warning describing the ratio and available pool.

### Direct Numeric Input

On input:

1. `parseInt` is used to read the value.
2. Values that are `NaN` or below `min` become `0`.
3. The value is clamped only against:
   - the input's raw `max`
   - `maxAffordableTokens`
4. It does not also clamp against `tokensNeededForBlowUp`.

Consequently, direct entry can select more Token units than are needed for blow-up. The later combined-flow result determines whether the die blows up and how the cumulative total is modified.

If injury levels or availability change after the control is created, direct input uses the current actor values.

### Paste

The paste handler clamps to `0` through `999` but does not apply the injury-adjusted `maxAffordableTokens` limit. The subsequent input/button behavior is not explicitly recalculated by the paste handler; it only updates combined-button text.

The paste edge therefore differs from direct numeric input and is not injury-aware within that handler.

### Keyboard

The keyboard handler prevents:

- Minus
- Plus
- Decimal

It allows normal editing, navigation, copy, paste, undo-like browser keys, and Enter.

## Combined Accept/Add-Token Flow

The `.combined-roll-btn` is the authoritative injury-adjusted Token-spending action in the current chat UI.

If the requested Token input is `0`, the button accepts the roll. It does not spend or refund Tokens.

If the requested Token input is greater than `0`, the combined flow:

1. Parses the input with `parseInt`
2. Clamps negative or invalid values to `0`
3. Calculates injury-adjusted Token information
4. Rejects the action if `actualCost > availableTokens`
5. Calculates the die result as `dieValue + requestedTokens`
6. Calculates the cumulative total
7. Deducts `actualCost` from `system.turboTokens`
8. Adds `actualCost` to `system.tokensSpentThisEpisode`
9. Continues, accepts, or blow-ups based on the die result

The UI's "requested Token" unit is not equal to the actor pool cost when injured.

Example:

```text
die result: 5
die maximum: d6
requested roll units: 1
injury level: 2
actual pool cost: 2
new actor pool: previous pool - 2
episode spending: previous spending + 2
```

The actor's episode-spending field is incremented by `actualCost`, not by the number of requested roll units.

### Insufficient Funds

If the action is unaffordable:

- The combined button is re-enabled
- Processing state is removed
- No actor update occurs in that branch
- No stat progression occurs in that branch
- No chat-result progression occurs in that branch

The player receives:

```text
You don't have enough turbo tokens! Need <actualCost>, have <availableTokens>
```

At injury level `2` or greater, the notification also contains:

```text
(<requestedTokens> tokens × 2 = <actualCost> due to injury)
```

The notification is not issued when the requested count is `0`.

### Successful Spending

Successful spending updates both fields in one actor update:

```text
system.turboTokens = availableTokens - actualCost
system.tokensSpentThisEpisode = currentEpisodeTokens + actualCost
```

The actor update uses the pool value that was read by `getInjuryAdjustedTokenInfo` for that click.

No compare-and-refresh or optimistic-concurrency guard is used in this code path.

## Auto-Blow-Up Flow

The auto-blow-up button determines `tokensNeeded` as:

```text
tokensNeeded = currentDie - dieValue
```

It compares that value directly against the actor's raw Turbo Token pool:

```text
tokensNeeded > currentTokens
```

It does not calculate injury-adjusted cost at this first gate.

If enough raw Tokens appear to exist:

1. The input is set to `tokensNeeded`
2. Combined-button text is updated
3. The combined button is triggered
4. The combined flow applies the injury cost and may reject it

If it appears unaffordable with the raw pool:

- The auto action stops
- The warning states the required raw number and raw available pool
- It does not calculate or display the `2:1` injury cost

The auto-blow-up button's HTML initially disables itself using raw pool availability only:

```text
tokensNeeded > currentTokens
```

The injury-adjusted cost is not included in that disabled state. The `refresh-tokens` handler also rechecks only:

```text
tokensNeeded > 0 && tokensNeeded <= currentTokens
```

Therefore, the injury-adjusted behavior has an implementation mismatch:

- The auto and refresh UI checks use raw Tokens
- The combined spending action uses injury-adjusted pool cost
- The combined action is the authority that rejects or spends at `2:1`

### Auto-Blow-Up Injury Edge Cases

Examples:

| Die result | Die maximum | Needed units | Injury | Raw pool | First auto check | Combined result |
|---|---|---|---|---|---|---|
| `5` | d6 | `1` | Severe/Adrenalized | `1` | Pass | Reject: cost `2`, pool `1` |
| `5` | d6 | `1` | Severe/Adrenalized | `2` | Pass | Succeed: cost `2` |
| `4` | d6 | `2` | Severe/Adrenalized | `3` | Pass | Reject: cost `4`, pool `3` |
| `4` | d6 | `2` | Severe/Adrenalized | `4` | Pass | Succeed: cost `4` |
| `5` | d6 | `1` | Severe/Adrenalized | `0` | Reject raw | No combined action |

The auto action can therefore appear enabled or pass its raw check before the combined action rejects it under injury.

## Refresh-Tokens Flow

The refresh-tokens button reads the current actor pool:

```text
availableTokens = Number(actor.system.turboTokens) || 0
```

It updates:

- `.available-tokens`
- The input `max`
- The input value to `0`
- Add-tokens and auto-blow-up button disabled states

Refresh is raw-pool-aware and does not apply injury ratios.

The auto-blow-up state after refresh is based on:

```text
tokensNeeded > 0 && tokensNeeded <= currentTokens
```

If injured at `2:1`, the auto button can remain enabled even though combined spending may not be affordable.

## Injury Control Behavior

The character and NPC sheet add injury control has:

- Minimum level `0`
- Maximum level `3`
- A `+` button that only increments from `0` to `3`
- A `-` button that only decrements from `1` to `0`

When the injury level changes from `2` to `3`:

- The sheet sets `system.injuries` to `3`
- It adds `10` to `system.turboTokens`
- It creates an informational notification:

```text
Adrenalized! Gained 10 Turbo Tokens!
```

This bonus is added as soon as the `+` control reaches `3`.

When the level decreases from `3`:

- The implementation decreases `system.injuries`
- It does not remove the previously granted `10` Tokens
- It does not change any episode-spending total

Direct manual injury input can set values outside `0-3`; the runtime input handler does not clamp the injury field. The cost ratio then follows the numeric comparison described above.

## Legacy Add-Tokens Handler

The repository also contains a global `.add-tokens-to-die-btn` handler.

That older handler:

- Compares requested Tokens directly against raw `actor.system.turboTokens`
- Deducts the requested count directly
- Adds the requested count directly to `system.tokensSpentThisEpisode`
- Does not call `getInjuryAdjustedTokenInfo`
- Does not apply a `2:1` injury ratio

Current roll markup uses `.combined-roll-btn`, not `.add-tokens-to-die-btn`, for its interactive Token action. The legacy handler is therefore not the active injury-adjusted implementation for generated current roll messages.

If external code or custom markup invokes `.add-tokens-to-die-btn`, it does not implement injury-adjusted spending.

## Summary of Implemented Rules

| Situation | Implemented behavior |
|---|---|
| Injury `0` or `1` | `1:1` cost |
| Injury `2` or `3` | `2:1` cost in combined spending |
| Injury greater than `3` | `2:1` cost |
| Negative injury | `1:1` cost |
| Missing injury | `1:1` cost |
| Reaching Adrenalized at level `3` | Add 10 actor Turbo Tokens |
| Leaving Adrenalized | Do not remove the 10 bonus Tokens |
| Combined flow, insufficient pool | Reject without actor or chat mutation |
| Combined flow, sufficient pool | Deduct actual pool cost and add actual cost to episode spending |
| Auto-blow-up raw check | Uses raw available pool, not injury-adjusted cost |
| Refresh raw check | Uses raw available pool, not injury-adjusted cost |
| Legacy add-Tokens handler | Ignores injury-adjusted cost |
