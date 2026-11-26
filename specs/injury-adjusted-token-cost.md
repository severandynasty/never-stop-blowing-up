# Injury-adjusted Turbo Token cost

## Purpose and scope

This specification records the current behavior of `getInjuryAdjustedTokenInfo` and its use by the interactive roll controls. It describes the implementation, including its edge cases; it does not define a new rule.

Sources: [pure rule implementation](../scripts/rules/injury-adjusted-token-cost.js), [Foundry integration](../scripts/nsbu.js), [actor defaults](../template.json), and [existing injury documentation](../docs/injury-token-costs.md). Where the documentation and implementation differ, the implementation below describes the behavior.

## Inputs

The helper takes `actor` and `requestedTokens`.

| Input | Meaning |
| --- | --- |
| `actor?.system?.injuries` | Injury level. Character and NPC templates default to `0`. |
| `actor?.system?.turboTokens` | Available Turbo Token pool. Both actor templates default to `0`. |
| `requestedTokens` | Number of units to add to the die result; this is not necessarily the number deducted from the pool. |

The helper can read a missing actor or missing `system` via optional chaining. It does not itself parse, clamp, or validate `requestedTokens`.

## Outputs and formulas

The helper returns an object with exactly these properties, calculated using JavaScript semantics:

```javascript
const injuryLevel = actor?.system?.injuries || 0;
const tokenRatio = injuryLevel >= 2 ? 2 : 1;
const actualCost = requestedTokens * tokenRatio;
const availableTokens = Number(actor?.system?.turboTokens) || 0;
const maxAffordableTokens = Math.floor(availableTokens / tokenRatio);
const canAfford = actualCost <= availableTokens;
```

| Output | Meaning |
| --- | --- |
| `injuryLevel` | Original truthy injury value, or `0` if it is falsy. |
| `tokenRatio` | Pool Tokens charged per requested roll unit: `2` when `injuryLevel >= 2`, otherwise `1`. |
| `actualCost` | Requested roll units multiplied by the ratio. |
| `availableTokens` | Pool converted with `Number`, or `0` if the result is falsy. |
| `maxAffordableTokens` | Available pool divided by the ratio and rounded toward negative infinity. |
| `canAfford` | Whether `actualCost <= availableTokens`. |

The helper only returns values; it does not update an actor, modify a roll, or issue a notification.

## Combined roll control

The generated interactive roll controls use `.combined-roll-btn`. On click:

1. If the actor is missing or the current user is not its owner, the handler warns and returns. A disabled or processing button is also ignored.
2. The handler obtains `tokensToAdd` as `Math.max(0, parseInt(inputValue) || 0)`.
3. If `tokensToAdd` is `0`, it follows the accept-roll branch without calling the cost helper or spending Tokens.
4. Otherwise, it calls the helper with the current actor and `tokensToAdd`.
5. If `canAfford` is false, it re-enables the button, removes its processing class, and warns. It makes no actor update or chat-result update in that branch. When the ratio is `2`, the warning includes the requested units, ratio, and cost.
6. If affordable, it adds `tokensToAdd` to the die result, not `actualCost`. In one actor update it sets `system.turboTokens` to `availableTokens - actualCost` and `system.tokensSpentThisEpisode` to `(Number(actor.system.tokensSpentThisEpisode) || 0) + actualCost`.
7. If the new die result is at least the current die size, the blow-up branch runs; otherwise, the result is finalized. Direct input is not capped to the number needed to blow up, so the new result can exceed the die size.

The calculation reads the actor's current fields at the click; the code does not perform an atomic compare-and-update across clients. If a later stat or chat update fails, the preceding Token update is not rolled back by this handler.

## Roll-control limits

- **Plus:** `current = parseInt(input.value) || 0`, `maxAvailable = parseInt(input.max) || 0`, and `needed = currentDie - dieValue`. The effective maximum is `Math.min(maxAvailable, needed, maxAffordableTokens)`, using current actor data. The value increments only when `current < effectiveMax`.
- **Direct input:** `min = parseInt(input.min) || 0`, `max = parseInt(input.max) || 999`, and the effective maximum is `Math.min(max, maxAffordableTokens)`. An invalid or below-minimum value is set to `min`; otherwise, a value above the effective maximum is set to that maximum. This path does not cap the value at `needed`. A `max` attribute of `0` becomes `999` in this calculation.
- **Paste:** After a one-millisecond timeout, the paste handler independently parses the input and clamps it to `min` or `max`, where `min` and `max` use the same `|| 0` and `|| 999` fallbacks as direct input. It does not calculate the injury-adjusted maximum; a separate input event may also run.
- **Auto blow-up:** The button's initial disabled state and the click handler compare `needed = currentDie - dieValue` with the raw pool, not the injury-adjusted cost. When `needed > 0` and `needed <= currentTokens`, the handler sets the input to `needed` and triggers the combined button, which then applies the cost calculation and can reject the spend.
- **Refresh:** Refresh reads the current raw pool, updates the displayed pool and input `max`, and resets the input to `0`. It enables auto blow-up only when `needed > 0 && needed <= currentTokens`; it does not use the injury-adjusted cost for that check.
- **Warning:** For an owner viewing a roll message, the render hook shows `Injured! Tokens cost 2:1` when injury is at least `2`, and hides the warning otherwise. The plus handler updates it on a successful increment, and the input handler also updates it.

The separately registered `.add-tokens-to-die-btn` handler deducts the requested count and increments episode spending by that same count without calling the injury helper. Current generated roll markup uses `.combined-roll-btn` instead.

## Edge cases

- Injury values `0` and `1` use `1:1`; `2`, `3`, and values above `3` use `2:1`. Negative values use `1:1`. The helper does not clamp injury.
- A falsy injury value, including `undefined`, `null`, `false`, `NaN`, or an empty string, becomes numeric `0`. A truthy numeric string such as `"2"` remains a string in the output but compares as a number; a nonnumeric string such as `"severe"` remains in the output and selects `1:1`.
- A missing pool, an empty string, or a pool that converts to `NaN` becomes `0`. Numeric strings become numbers. Negative and fractional pools are retained, and `Math.floor` is applied to their quotient.
- A direct helper call with zero requested units can return `canAfford: false` when the available pool is negative. The combined control's zero branch does not call the helper.
- A negative, fractional, or nonnumeric request passed directly to the helper is not rejected or clamped. Multiplication uses JavaScript coercion; for example, `NaN` produces `actualCost: NaN` and `canAfford: false`. The combined control instead parses and clamps its own input.
- At `2:1`, an odd nonnegative integer pool leaves one Token that cannot pay for an additional whole requested unit.
- The sheet injury `+` handler gives 10 Tokens when the resulting injury value is exactly `3`. Decreasing injury does not remove that bonus; moving from `2` to `3` again grants it again. Directly editing the injury input uses the generic field update and does not invoke that bonus handler.

## Examples

| Injury | Available | Requested | Ratio | Cost | Maximum affordable | Affordable |
| ---: | ---: | ---: | ---: | ---: | ---: | :--- |
| 0 | 5 | 2 | 1 | 2 | 5 | yes |
| 1 | 5 | 2 | 1 | 2 | 5 | yes |
| 2 | 5 | 2 | 2 | 4 | 2 | yes |
| 3 | 5 | 3 | 2 | 6 | 2 | no |
| 2 | 1 | 1 | 2 | 2 | 0 | no |
| 2 | 0 | 0 | 2 | 0 | 0 | yes |

For an owned actor with injury `2`, a pool of `5`, and episode spending of `3`, adding `2` roll units costs `4`: the pool becomes `1`, episode spending becomes `7`, and the die result increases by `2`.

## Acceptance tests

These are behavioral examples of the current code. The [Vitest tests](../tests/injury-adjusted-token-cost.test.js) cover the helper cases and selected combined-control behavior using mocked Foundry globals; they do not run in a Foundry world.

### Helper results

Each row calls `getInjuryAdjustedTokenInfo({system: {injuries, turboTokens: pool}}, requested)`. Output tuples are `(injuryLevel, tokenRatio, actualCost, availableTokens, maxAffordableTokens, canAfford)`.

| Injuries | Pool | Requested | Expected output tuple |
| --- | --- | --- | --- |
| `0` | `5` | `2` | `(0, 1, 2, 5, 5, true)` |
| `1` | `5` | `2` | `(1, 1, 2, 5, 5, true)` |
| `2` | `5` | `2` | `(2, 2, 4, 5, 2, true)` |
| `3` | `5` | `3` | `(3, 2, 6, 5, 2, false)` |
| `4` | `4` | `2` | `(4, 2, 4, 4, 2, true)` |
| `-1` | `2` | `1` | `(-1, 1, 1, 2, 2, true)` |
| `"2"` | `"5"` | `2` | `("2", 2, 4, 5, 2, true)` |
| `"severe"` | `2` | `1` | `("severe", 1, 1, 2, 2, true)` |
| `2` | `1` | `1` | `(2, 2, 2, 1, 0, false)` |
| `2` | `-1` | `0` | `(2, 2, 0, -1, -1, false)` |
| `2` | `3.5` | `1` | `(2, 2, 2, 3.5, 1, true)` |
| `2` | `5` | `-1` | `(2, 2, -2, 5, 2, true)` |
| `2` | `5` | `NaN` | `(2, 2, NaN, 5, 2, false)` |

With a missing actor and request `1`, the expected tuple is `(0, 1, 1, 0, 0, false)`. With injury `null`, pool `"not a number"`, and request `0`, the expected tuple is `(0, 1, 0, 0, 0, true)`.

### Interactive behavior

1. **Successful injured spend:** Given an owner with injury `2`, pool `5`, episode spending `3`, and a roll of `2` on a d6, when the combined button adds `2`, the actor update sets the pool to `1` and episode spending to `7`; the die result becomes `4`.
2. **Insufficient injured spend:** Given an owner with injury `2`, pool `3`, and requested units `2`, when the combined button is clicked, the cost is `4`; the handler warns, re-enables the button, and does not update the actor or chat result.
3. **Zero input:** Given an owner with injury `2` and input `0`, clicking the combined button takes the accept branch without a Token or episode-spending update.
4. **Auto blow-up mismatch:** Given an owner with injury `2`, pool `1`, and a d6 result of `5`, the raw auto check permits `1` requested unit, but the triggered combined action rejects it because the cost is `2`.
5. **Over-max direct input:** Given injury `2`, pool `10`, input maximum `10`, and a d6 result of `5`, an input event with value `2` leaves `2` selected; the combined action costs `4`, adds `2` to the die, and enters the blow-up branch with a die result of `7`.
6. **Legacy handler:** Given an owner with injury `2`, pool `3`, and a custom `.add-tokens-to-die-btn` control requesting `2`, the legacy handler deducts `2` and adds `2` to episode spending, rather than charging `4`.
7. **Adrenalized control:** Given injury `2` and pool `3`, clicking the sheet injury `+` sets injury to `3` and pool to `13`. Clicking `-` sets injury back to `2` without subtracting the bonus.
