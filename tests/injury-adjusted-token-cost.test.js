import { readFileSync } from "node:fs";
import { createContext, runInContext } from "node:vm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getInjuryAdjustedTokenInfo } from "../scripts/rules/injury-adjusted-token-cost.js";

// Load runtime handlers without executing Foundry lifecycle hooks.
function loadRuntime() {
  const hooks = new Map();
  const handlers = new Map();
  const document = {};
  const emptySelection = {
    each() {},
    off() { return this; },
    on(event, selector, handler) {
      handlers.set(`${event}:${selector}`, handler);
      return this;
    },
  };
  const context = createContext({
    Hooks: {
      once(name, handler) { hooks.set(name, handler); },
      on() {},
    },
    ActorSheet: class {},
    ItemSheet: class {},
    document,
    $: () => emptySelection,
    MutationObserver: class { observe() {} },
    game: { actors: { contents: [] } },
    getInjuryAdjustedTokenInfo,
    console,
    setTimeout,
    clearTimeout,
  });
  const source = readFileSync(new URL("../scripts/nsbu.js", import.meta.url), "utf8");
  const runtimeSource = source.replace(
    /^import \{ getInjuryAdjustedTokenInfo \} from "\.\/rules\/injury-adjusted-token-cost\.js";\r?\n/m,
    "",
  );
  runInContext(runtimeSource, context, { filename: "nsbu.js" });
  return {
    context,
    hooks,
    handlers,
  };
}

describe("injury-adjusted token cost", () => {
  it.each([
    [0, 5, 2, [0, 1, 2, 5, 5, true]],
    [1, 5, 2, [1, 1, 2, 5, 5, true]],
    [2, 5, 2, [2, 2, 4, 5, 2, true]],
    [3, 5, 3, [3, 2, 6, 5, 2, false]],
    [4, 4, 2, [4, 2, 4, 4, 2, true]],
    [-1, 2, 1, [-1, 1, 1, 2, 2, true]],
    ["2", "5", 2, ["2", 2, 4, 5, 2, true]],
    ["severe", 2, 1, ["severe", 1, 1, 2, 2, true]],
    [2, 1, 1, [2, 2, 2, 1, 0, false]],
    [2, 0, 0, [2, 2, 0, 0, 0, true]],
    [2, -1, 0, [2, 2, 0, -1, -1, false]],
    [2, 3.5, 1, [2, 2, 2, 3.5, 1, true]],
    [2, 5, -1, [2, 2, -2, 5, 2, true]],
    [2, 5, NaN, [2, 2, NaN, 5, 2, false]],
  ])("calculates injury %s, pool %s, request %s", (injuries, pool, requested, expected) => {
    const result = getInjuryAdjustedTokenInfo({ system: { injuries, turboTokens: pool } }, requested);

    expect({ ...result }).toStrictEqual({
      injuryLevel: expected[0],
      tokenRatio: expected[1],
      actualCost: expected[2],
      availableTokens: expected[3],
      maxAffordableTokens: expected[4],
      canAfford: expected[5],
    });
  });

  it("uses zero for a missing actor or nonnumeric pool", () => {
    expect({ ...getInjuryAdjustedTokenInfo(undefined, 1) }).toStrictEqual({
      injuryLevel: 0,
      tokenRatio: 1,
      actualCost: 1,
      availableTokens: 0,
      maxAffordableTokens: 0,
      canAfford: false,
    });
    expect({ ...getInjuryAdjustedTokenInfo({ system: { injuries: null, turboTokens: "not a number" } }, 0) })
      .toStrictEqual({
        injuryLevel: 0,
        tokenRatio: 1,
        actualCost: 0,
        availableTokens: 0,
        maxAffordableTokens: 0,
        canAfford: true,
      });
  });
});

describe("combined roll token spending", () => {
  let runtime;
  let actor;
  let message;
  let warn;
  let input;
  let button;
  let details;
  let triggered;

  beforeEach(() => {
    runtime = loadRuntime();
    actor = {
      id: "actor",
      isOwner: true,
      system: { injuries: 2, turboTokens: 5, tokensSpentThisEpisode: 3 },
      update: vi.fn().mockResolvedValue(undefined),
    };
    message = { content: "roll", update: vi.fn().mockResolvedValue(undefined) };
    warn = vi.fn();
    input = { value: "2" };
    button = {
      data: {
        "actor-id": "actor",
        "die-value": 2,
        "current-die": 6,
        "current-die-idx": 1,
        "cumulative-total": 2,
        "final-total": 2,
        stat: "weapons",
      },
      disabled: false,
      classes: new Set(),
    };
    details = [];
    triggered = undefined;

    class Selection {
      constructor(element = {}) { this.element = element; }
      each() {}
      off() { return this; }
      on(event, selector, handler) {
        runtime.handlers.set(`${event}:${selector}`, handler);
        return this;
      }
      data(key) { return this.element.data?.[key]; }
      prop(key, value) {
        if (value === undefined) return this.element[key];
        this.element[key] = value;
        return this;
      }
      hasClass(name) { return this.element.classes?.has(name) ?? false; }
      addClass(name) { this.element.classes?.add(name); return this; }
      removeClass(name) { this.element.classes?.delete(name); return this; }
      closest(selector) {
        if (selector === ".roll-controls") return new Selection({ kind: "controls" });
        if (selector === ".message") return new Selection({ data: { "message-id": "message" } });
        return new Selection();
      }
      find(selector) {
        if (selector === ".token-input") return new Selection(input);
        if (selector === ".combined-roll-btn") return new Selection(button);
        return new Selection({ selector });
      }
      val(value) {
        if (value === undefined) return this.element.value;
        this.element.value = value;
        return this;
      }
      html(value) {
        if (value === undefined) return "updated roll";
        if (this.element.selector === ".roll-details") details.push(value);
        return this;
      }
      append(value) { details.push(value); return this; }
      remove() { return this; }
      text() { return this; }
      css() { return this; }
      trigger() {
        const handler = runtime.handlers.get("click.nsbu-combined:.combined-roll-btn");
        triggered = handler.call(this.element, { preventDefault() {}, stopPropagation() {} });
        return this;
      }
    }

    runtime.context.$ = (element) => new Selection(element);
    runtime.context.game = {
      actors: { contents: [], get: () => actor },
      messages: { get: () => message },
    };
    runtime.context.ui = { notifications: { warn } };
    runtime.hooks.get("ready")();
  });

  async function clickCombined() {
    const handler = runtime.handlers.get("click.nsbu-combined:.combined-roll-btn");
    await handler.call(button, { preventDefault() {}, stopPropagation() {} });
  }

  it("deducts the injury-adjusted cost and adds requested units to the roll", async () => {
    await clickCombined();

    expect(actor.update).toHaveBeenCalledOnce();
    expect(actor.update.mock.calls[0][0]).toMatchObject({
      "system.turboTokens": 1,
      "system.tokensSpentThisEpisode": 7,
    });
    expect(details).toContain("Rolling WEAPONS (d6): 2 + 2 tokens = 4");
    expect(message.update).toHaveBeenCalledOnce();
  });

  it("rejects an unaffordable injured spend without changing actor or chat", async () => {
    actor.system.turboTokens = 3;
    await clickCombined();

    expect(actor.update).not.toHaveBeenCalled();
    expect(message.update).not.toHaveBeenCalled();
    expect(button.disabled).toBe(false);
    expect(button.classes.has("processing")).toBe(false);
    expect(warn).toHaveBeenCalledWith(
      "You don't have enough turbo tokens! Need 4, have 3 (2 tokens × 2 = 4 due to injury)",
    );
  });

  it("accepts zero tokens without changing the actor", async () => {
    input.value = "0";
    await clickCombined();

    expect(actor.update).not.toHaveBeenCalled();
    expect(message.update).toHaveBeenCalledOnce();
  });

  it("allows the raw auto-blow-up check but rejects the injury-adjusted cost", async () => {
    actor.system.turboTokens = 1;
    button.data["die-value"] = 5;
    const handler = runtime.handlers.get("click.nsbu-auto-blowup:.auto-blowup-btn");
    await handler.call(button, { preventDefault() {}, stopPropagation() {} });
    await triggered;

    expect(input.value).toBe(1);
    expect(actor.update).not.toHaveBeenCalled();
    expect(message.update).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(
      "You don't have enough turbo tokens! Need 2, have 1 (1 tokens × 2 = 2 due to injury)",
    );
  });

  it("does not spend tokens when the user does not own the actor", async () => {
    actor.isOwner = false;
    await clickCombined();

    expect(actor.update).not.toHaveBeenCalled();
    expect(message.update).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith("You don't have permission to control this character's rolls.");
  });
});
