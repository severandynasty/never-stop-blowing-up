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
  data.system = foundry.utils.mergeObject(defaults, data.system ?? {}, { inplace: false });
  console.log('[NSBU] Merged data.system:', data.system);
});
class NSBUActorSheet extends ActorSheet {
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
      // Convert to number if type is number
      if (input.type === 'number') value = Number(value);
      // Build update data object
      const updateData = {};
      // Support nested property names (e.g., system.stats.grit)
      const keys = name.split('.');
      let ref = updateData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!ref[keys[i]]) ref[keys[i]] = {};
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
  console.log('[NSBU] Auto-save field:', name, 'Value:', value, 'UpdateData:', updateData);
  // Merge update into current actor data
  const merged = foundry.utils.mergeObject(this.actor.toObject(), updateData, { inplace: false });
  await this.actor.update(merged.system);
  this.render();
    });
  }
}

Hooks.once("init", () => {
  // Define the system model to match template.json
  game.system.model = {
    Actor: {
      character: {
        system: {
          stats: {
            grit: { type: Number, default: 1 },
            fight: { type: Number, default: 1 },
            flight: { type: Number, default: 1 },
            brains: { type: Number, default: 1 },
            charm: { type: Number, default: 1 },
            brawn: { type: Number, default: 1 }
          },
          hp: { type: Number, default: 10 },
          boomLevel: { type: Number, default: 1 },
          inventory: { type: Array, default: [] },
          skills: {
            explosives: { type: Number, default: 1 },
            athletics: { type: Number, default: 1 },
            mechanics: { type: Number, default: 1 },
            perception: { type: Number, default: 1 }
          }
        }
      },
      npc: {
        system: {
          stats: {
            threat: { type: Number, default: 1 },
            brawn: { type: Number, default: 1 }
          },
          hp: { type: Number, default: 8 }
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

  // Register the custom actor sheet for all actor types
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("never-stop-blowing-up", NSBUActorSheet, {
    types: ["character", "npc", "vehicle"],
    makeDefault: true
  });
});
