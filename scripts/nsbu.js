// Register a Handlebars helper for JSON debug output
Hooks.once('init', () => {
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
    // Include owned items for abilities display
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
      // Handle checkboxes: unchecked boxes are not submitted, so use hidden fields
      if (input.type === 'checkbox') {
        value = input.checked ? true : false;
      } else if (input.type === 'number') {
        value = Number(value);
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      // Build update data object
      const updateData = {};
      const keys = name.split('.');
      let ref = updateData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!ref[keys[i]]) ref[keys[i]] = {};
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      console.log('[NSBU] Auto-save field:', name, 'Value:', value, 'UpdateData:', updateData);
      await this.actor.update(updateData);
      this.render();
    });

    // Remove ability button
    html.find('.remove-ability').on('click', async (event) => {
      event.preventDefault();
      const itemId = event.currentTarget.dataset.itemId;
      if (itemId) {
        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
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

  // Register the custom item sheet for all item types
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("never-stop-blowing-up", NSBUItemSheet, {
  types: ["explosive", "gear", "Item"],
    makeDefault: true
  });
});

Hooks.once('ready', async function() {
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

  // Folder and item assignment for Group Abilities: only operate on world compendium
  const worldPack = game.packs.find(p => p.metadata.name === "group-abilities" && p.metadata.package === "world");
  if (!worldPack) {
    console.warn("[NSBU] World compendium 'group-abilities' not found.");
    return;
  }
  // Log folders in the world compendium
  if (worldPack.folders) {
    console.log("[NSBU] World Group Abilities Folders:", worldPack.folders);
  } else {
    console.warn("[NSBU] No folders found in world Group Abilities compendium.");
  }
  // Log all items and their folder/type
  const docs = await worldPack.getDocuments();
  for (const doc of docs) {
    console.log(`[NSBU] Item: ${doc.name} | Type: ${doc.type} | Folder: ${doc.folder}`);
    if (doc.type !== "Item") {
      console.warn(`[NSBU] Item '${doc.name}' has unexpected type: ${doc.type}`);
    }
  }

  // Auto-create folders and assign items in world Group Abilities compendium at world init
  await worldPack.getDocuments(); // Ensure items are loaded

  // Folder definitions
  const folderDefs = [
    { _id: "la-familia", name: "La Familia (Unlocked at d6)", color: "#e57373" },
    { _id: "criminal-conspiracy", name: "Criminal Conspiracy (Unlocked at d6)", color: "#ba68c8" },
    { _id: "diesel-circus", name: "Diesel Circus (Unlocked at d8)", color: "#64b5f6" },
    { _id: "the-continentals", name: "The Continentals (Unlocked at d8)", color: "#ffd54f" },
    { _id: "alpha-squad", name: "Alpha Squad (Unlocked at d10)", color: "#81c784" },
    { _id: "marauders", name: "Marauders (Unlocked at d10)", color: "#ffb74d" },
    { _id: "the-ones", name: "The Ones (Unlocked at d12)", color: "#4dd0e1" },
    { _id: "tactical-command", name: "Tactical Command (Unlocked at d12)", color: "#a1887f" },
    { _id: "bustin", name: "Bustin' Makes Me Feel Good (Unlocked at d20)", color: "#f06292" }
  ];

  // Create folders if missing
  for (const def of folderDefs) {
    let folder = worldPack.folders.find(f => f.name === def.name);
    if (!folder) {
      await Folder.create({
        name: def.name,
        type: "Item",
        color: def.color,
        parent: null,
        sorting: "a",
        folder: null,
        pack: worldPack.collection
      }, { pack: worldPack.collection });
    }
  }

  // Map folder names to IDs
  const folders = {};
  for (const f of worldPack.folders) {
    folders[f.name] = f.id;
  }

  // Assign items to folders
  const items = await worldPack.getDocuments();
  for (const item of items) {
    const suite = item.system.groupSuite;
    if (suite && folders[suite] && item.folder !== folders[suite]) {
      await item.update({ folder: folders[suite] });
    }
  }
});

// Macro/script to clone system compendiums into world-level compendiums and organize folders
Hooks.once('ready', async function() {
  if (!game.user.isGM) return;
  // Wait for system to be fully initialized
  await new Promise(r => setTimeout(r, 1000));
  // List of system compendiums to clone
  const packsToClone = [
    { sys: "never-stop-blowing-up.abilities", world: "abilities" },
    { sys: "never-stop-blowing-up.group-abilities", world: "group-abilities" }
  ];

  for (const { sys, world } of packsToClone) {
    const sysPack = game.packs.get(sys);
    if (!sysPack) {
      console.warn(`[NSBU] System compendium not found: ${sys}`);
      continue;
    }
    // Wait for system compendium to be unlocked and loaded
    let sysIndex;
    for (let i = 0; i < 10; i++) {
      sysIndex = await sysPack.getIndex();
      if (sysIndex.size > 0) break;
      console.log(`[NSBU] Waiting for system compendium '${sys}' to populate...`);
      await new Promise(r => setTimeout(r, 500));
    }
    if (!sysIndex || sysIndex.size === 0) {
      console.error(`[NSBU] System compendium '${sys}' is empty or not loaded!`);
      continue;
    }
    console.log(`[NSBU] System compendium '${sys}' index:`, Array.from(sysIndex.values()));
    // Check if world compendium already exists
    let worldPack = game.packs.find(p => p.metadata.name === world && p.metadata.package === "world");
    if (!worldPack) {
      // Create world compendium only if it does not exist
      try {
        await CompendiumCollection.createCompendium({
          label: sysPack.metadata.label.replace(/^SYSTEM - /, ""),
          name: world,
          type: sysPack.metadata.type,
          package: "world"
        });
        // Wait for compendium to be available
        for (let i = 0; i < 10; i++) {
          await new Promise(r => setTimeout(r, 200));
          worldPack = game.packs.find(p => p.metadata.name === world && p.metadata.package === "world");
          if (worldPack) break;
        }
      } catch (e) {
        console.error(`[NSBU] Failed to create world compendium: ${world} (may already exist)`, e);
        // Try to get the pack again in case it was created concurrently
        worldPack = game.packs.find(p => p.metadata.name === world && p.metadata.package === "world");
      }
    }
    if (!worldPack) {
      console.error(`[NSBU] World compendium '${world}' not found after creation attempt.`);
      continue;
    }
    // Import all entries if world compendium is empty
    const worldIndex = await worldPack.getIndex();
    console.log(`[NSBU] System compendium '${sys}' has ${sysIndex.size} entries. World compendium '${world}' has ${worldIndex.size} entries.`);
    if (worldIndex.size === 0 && sysIndex.size > 0) {
      try {
        await worldPack.importAll();
        ui.notifications.info(`Imported all entries from ${sysPack.metadata.label} to world compendium.`);
        console.log(`[NSBU] Imported all entries from ${sysPack.metadata.label} to world compendium.`);
      } catch (e) {
        console.error(`[NSBU] importAll failed for ${world}:`, e);
      }
    }
  }

  // Folder organization for group-abilities (world compendium only)
  const groupPack = game.packs.find(p => p.metadata.name === "group-abilities" && p.metadata.package === "world");
  if (groupPack) {
    await groupPack.getDocuments();
    const folderDefs = [
      { name: "La Familia (Unlocked at d6)", color: "#e57373" },
      { name: "Criminal Conspiracy (Unlocked at d6)", color: "#ba68c8" },
      { name: "Diesel Circus (Unlocked at d8)", color: "#64b5f6" },
      { name: "The Continentals (Unlocked at d8)", color: "#ffd54f" },
      { name: "Alpha Squad (Unlocked at d10)", color: "#81c784" },
      { name: "Marauders (Unlocked at d10)", color: "#ffb74d" },
      { name: "The Ones (Unlocked at d12)", color: "#4dd0e1" },
      { name: "Tactical Command (Unlocked at d12)", color: "#a1887f" },
      { name: "Bustin' Makes Me Feel Good (Unlocked at d20)", color: "#f06292" }
    ];
    // Only operate on world compendium folders
    if (groupPack.metadata.package === "world") {
      // Create folders if missing
      for (const def of folderDefs) {
        let folder = groupPack.folders.find(f => f.name === def.name);
        if (!folder) {
          try {
            await Folder.create({
              name: def.name,
              type: "Item",
              color: def.color,
              parent: null,
              sorting: "a",
              folder: null,
              pack: groupPack.collection
            }, { pack: groupPack.collection });
          } catch (e) {
            console.error(`[NSBU] Failed to create folder '${def.name}':`, e);
          }
        }
      }
      // Map folder names to IDs
      const folders = {};
      for (const f of groupPack.folders) {
        folders[f.name] = f.id;
      }
      // Assign items to folders
      const items = await groupPack.getDocuments();
      for (const item of items) {
        const suite = item.system.groupSuite;
        if (suite && folders[suite] && item.folder !== folders[suite]) {
          try {
            await item.update({ folder: folders[suite] });
          } catch (e) {
            console.error(`[NSBU] Failed to assign item '${item.name}' to folder '${suite}':`, e);
          }
        }
      }
    }
  } else {
    console.warn("[NSBU] World compendium 'group-abilities' not found for folder organization.");
  }
});
