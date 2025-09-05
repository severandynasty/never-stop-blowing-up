// Register a Handlebars helper for JSON debug output
Hooks.once('init', () => {
  // Register 'upgrade' as a valid item type for Foundry
  if (!CONFIG.Item.typeLabels) CONFIG.Item.typeLabels = {};
  CONFIG.Item.typeLabels.upgrade = "Upgrade";
  Handlebars.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
  });
});
// Helper to get defaults for an actor type
function getActorDefaults(type) {
  const model = game.system.model?.Actor?.[type]?.system;
  if (!model) return {};
  // Recursively extract default values
  function extractDefaults(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.slice();
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && 'default' in value) {
        result[key] = value.default;
      } else {
        result[key] = extractDefaults(value);
      }
    }
    return result;
  }
  return extractDefaults(model);
}

// Initialize new actors with defaults
Hooks.on('preCreateActor', (actor, data, options, userId) => {
  const type = data.type;
  const defaults = getActorDefaults(type);
  console.log('[NSBU] preCreateActor type:', type);
  console.log('[NSBU] Defaults:', defaults);
  console.log('[NSBU] Incoming data.system:', data.system);
  // If data.system has a nested 'system' property, flatten it
  let incoming = data.system ?? {};
  if (incoming.system && typeof incoming.system === 'object') {
    incoming = Object.assign({}, incoming, incoming.system);
    delete incoming.system;
  }
  // Merge defaults and incoming data
  data.system = foundry.utils.mergeObject(defaults, incoming, { inplace: false });
  // Ensure no nulls for hp, boomLevel, etc.
  if (data.system.hp == null) data.system.hp = defaults.hp;
  if (data.system.boomLevel == null) data.system.boomLevel = defaults.boomLevel;
  console.log('[NSBU] Final merged data.system:', data.system);
});

class NSBUActorSheet extends ActorSheet {
  getData(options) {
    const data = super.getData(options);
    data.system = this.actor.system ?? {};
    data.items = this.actor.items ? this.actor.items.contents : [];
    return data;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["never-stop-blowing-up", "sheet", "actor"],
      template: "systems/never-stop-blowing-up/templates/actor-sheet.html",
      width: 600,
      height: 600
    });
  }
  async _updateObject(event, formData) {
    await this.actor.update(formData);
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find('input, select, textarea').on('change blur', async (event) => {
      const input = event.currentTarget;
      const name = input.name;
      let value = input.value;
      if (name === 'system.inventory') {
        await this.actor.update({ 'system.inventory': value });
        this.render();
        return;
      }
      if (input.type === 'checkbox') {
        value = input.checked ? true : false;
      } else if (input.type === 'number') {
        value = Number(value);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      const updateData = {};
      const keys = name.split('.');
      let ref = updateData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!ref[keys[i]]) ref[keys[i]] = {};
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      await this.actor.update(updateData);
      this.render();
    });

    // Dice blow-up mechanic for stats
    html.find('.stat-roll').on('click', async (event) => {
      event.preventDefault();
  const stat = event.currentTarget.dataset.stat;
  const stats = this.actor.system.stats || {};
  let statValue = Number(stats[stat]);
  if (!statValue || ![4,6,8,10,12].includes(statValue)) statValue = 4;
  // Map stat value to die type (now up to d20)
  const dieSteps = [4, 6, 8, 10, 12, 20];
  let dieIdx = dieSteps.indexOf(statValue);
  if (dieIdx === -1) dieIdx = 0;
  let currentDie = dieSteps[dieIdx];
      let total = 0;
      let rolls = [];
      let blowUp = false;
      do {
        const roll = new Roll(`1d${currentDie}`);
  await roll.evaluate();
        await roll.toMessage({flavor: `${stat.toUpperCase()} roll (d${currentDie})`});
        const value = roll.total;
        rolls.push(value);
        total += value;
        blowUp = (value === currentDie) && (dieIdx < dieSteps.length - 1);
        if (blowUp) {
          dieIdx++;
          currentDie = dieSteps[dieIdx];
        }
      } while (blowUp);
      // If the die blew up, update the stat to the new die
      if (dieIdx > dieSteps.indexOf(statValue)) {
        await this.actor.update({[`system.stats.${stat}`]: dieSteps[dieIdx]});
        ui.notifications.info(`${stat.charAt(0).toUpperCase() + stat.slice(1)} upgraded to d${dieSteps[dieIdx]}!`);
      }
    });

    html.find('.remove-ability').on('click', async (event) => {
      event.preventDefault();
      const itemId = event.currentTarget.dataset.itemId;
      if (itemId) {
        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
      }
    });
    html.find('.token-increase').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.turboTokens) || 0;
      await this.actor.update({ 'system.turboTokens': current + 1 });
      this.render();
    });
    html.find('.token-decrease').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.turboTokens) || 0;
      if (current > 0) {
        await this.actor.update({ 'system.turboTokens': current - 1 });
        this.render();
      }
    });
  }
}

class NSBUNPCSheet extends ActorSheet {
  getData(options) {
    const data = super.getData(options);
    data.system = this.actor.system ?? {};
    data.items = this.actor.items ? this.actor.items.contents : [];
    return data;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["never-stop-blowing-up", "sheet", "npc"],
      template: "systems/never-stop-blowing-up/templates/npc-sheet.html",
      width: 600,
      height: 600
    });
  }
  async _updateObject(event, formData) {
    await this.actor.update(formData);
  }
  activateListeners(html) {
    super.activateListeners(html);
    html.find('input, select').on('change blur', async (event) => {
      const input = event.currentTarget;
      const name = input.name;
      let value = input.value;
      if (input.type === 'checkbox') {
        value = input.checked ? true : false;
      } else if (input.type === 'number') {
        value = Number(value);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      const updateData = {};
      const keys = name.split('.');
      let ref = updateData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!ref[keys[i]]) ref[keys[i]] = {};
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      await this.actor.update(updateData);
      this.render();
    });
    html.find('.remove-ability').on('click', async (event) => {
      event.preventDefault();
      const itemId = event.currentTarget.dataset.itemId;
      if (itemId) {
        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
      }
    });
    html.find('.token-increase').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.turboTokens) || 0;
      await this.actor.update({ 'system.turboTokens': current + 1 });
      this.render();
    });
    html.find('.token-decrease').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.turboTokens) || 0;
      if (current > 0) {
        await this.actor.update({ 'system.turboTokens': current - 1 });
        this.render();
      }
    });
  }
}

class NSBUItemSheet extends ItemSheet {
  getData(options) {
    const data = super.getData(options);
    data.system = this.item.system ?? {};
    return data;
  }
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["never-stop-blowing-up", "sheet", "item"],
      template: "systems/never-stop-blowing-up/templates/item-sheet.html",
      width: 400,
      height: 300
    });
  }
}

Hooks.once("init", () => {
  // Define the system model to match template.json
  game.system.model = {
    Actor: {
      character: {
        system: {
          realWorldCharacter: { type: String, default: "" },
          catchphrase: { type: String, default: "" },
          stats: {
            weapons: { type: Number, default: 4 },
            brawl: { type: Number, default: 4 },
            hot: { type: Number, default: 4 },
            drive: { type: Number, default: 4 },
            stunts: { type: Number, default: 4 },
            wits: { type: Number, default: 4 },
            tech: { type: Number, default: 4 },
            tough: { type: Number, default: 4 },
            sneak: { type: Number, default: 4 }
          },
          hp: { type: Number, default: 10 },
          boomLevel: { type: Number, default: 1 },
          injuries: { type: Array, default: [false, false, false] },
          turboTokens: { type: Number, default: 0 },
          abilities: { type: Array, default: [] },
          groupAbilities: { type: Array, default: [] },
          inventory: { type: String, default: "" },
          bio: { type: String, default: "" }
        }
      },
      npc: {
        system: {
          realWorldCharacter: { type: String, default: "" },
          catchphrase: { type: String, default: "" },
          stats: {
            weapons: { type: Number, default: 4 },
            brawl: { type: Number, default: 4 },
            hot: { type: Number, default: 4 },
            drive: { type: Number, default: 4 },
            stunts: { type: Number, default: 4 },
            wits: { type: Number, default: 4 },
            tech: { type: Number, default: 4 },
            tough: { type: Number, default: 4 },
            sneak: { type: Number, default: 4 }
          },
          hp: { type: Number, default: 8 },
          boomLevel: { type: Number, default: 1 },
          injuries: { type: Array, default: [false, false, false] },
          turboTokens: { type: Number, default: 0 },
          abilities: { type: Array, default: [] },
          groupAbilities: { type: Array, default: [] },
          notes: { type: String, default: "" }
        }
      },
      vehicle: {
        system: {
          durability: { type: Number, default: 15 },
          speed: { type: Number, default: 5 },
          passengerCapacity: { type: Number, default: 4 }
        }
      }
    },
    Item: {
      explosive: {
        system: {
          damage: { type: Number, default: 2 },
          range: { type: String, default: "short" },
          special: { type: String, default: "" }
        }
      },
      gear: {
        system: {
          effect: { type: String, default: "" },
          uses: { type: Number, default: 1 }
        }
      },
      upgrade: {
        system: {
          bonus: { type: String, default: "" },
          appliesTo: { type: String, default: "" }
        }
      }
    }
  };

  // Register the custom actor sheets
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("never-stop-blowing-up", NSBUActorSheet, {
    types: ["character", "vehicle"],
    makeDefault: true
  });
  Actors.registerSheet("never-stop-blowing-up", NSBUNPCSheet, {
    types: ["npc"],
    makeDefault: true
  });

  // Register the custom item sheet for all item types
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("never-stop-blowing-up", NSBUItemSheet, {
  types: ["explosive", "gear", "upgrade"],
    makeDefault: true
  });
});

Hooks.once('setup', async function() {
  // Log all compendium packs
  console.log("Compendium Packs Loaded:");
  for (let pack of game.packs) {
    console.log(`Pack: ${pack.collection} | Label: ${pack.metadata.label} | Type: ${pack.metadata.type}`);
    if (pack.collection === "never-stop-blowing-up.abilities") {
      // Try to get all documents in the abilities compendium
      const index = await pack.getIndex();
      console.log("Abilities Compendium Index:", index);
      const docs = await pack.getDocuments();
      console.log("Abilities Compendium Documents:", docs);
    }
  }

  // All world compendium and folder logic removed. Now using only system compendiums per group suite.
  // No further action needed here.
});
