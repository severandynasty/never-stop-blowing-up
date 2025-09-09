class NSBUActorSheet extends ActorSheet {
  activateListeners(html) {
    super.activateListeners(html);
    const dieSteps = [4, 6, 8, 10, 12, 20];
    // Stat increase button
    html.find('.stat-increase').on('click', async (event) => {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const stats = this.actor.system.stats || {};
      let statValue = Number(stats[stat]);
      let idx = dieSteps.indexOf(statValue);
      if (idx === -1) idx = 0;
      if (idx < dieSteps.length - 1) {
        await this.actor.update({[`system.stats.${stat}`]: dieSteps[idx + 1]});
        this.render();
      }
    });
    // Stat decrease button
    html.find('.stat-decrease').on('click', async (event) => {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const stats = this.actor.system.stats || {};
      let statValue = Number(stats[stat]);
      let idx = dieSteps.indexOf(statValue);
      if (idx === -1) idx = 0;
      if (idx > 0) {
        await this.actor.update({[`system.stats.${stat}`]: dieSteps[idx - 1]});
        this.render();
      }
    });
    // Other listeners
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
      if (!statValue || ![4,6,8,10,12,20].includes(statValue)) statValue = 4;
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
    const dieSteps = [4, 6, 8, 10, 12, 20];
    // Stat increase button
    html.find('.stat-increase').on('click', async (event) => {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const stats = this.actor.system.stats || {};
      let statValue = Number(stats[stat]);
      let idx = dieSteps.indexOf(statValue);
      if (idx === -1) idx = 0;
      if (idx < dieSteps.length - 1) {
        await this.actor.update({[`system.stats.${stat}`]: dieSteps[idx + 1]});
        this.render();
      }
    });
    // Stat decrease button
    html.find('.stat-decrease').on('click', async (event) => {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const stats = this.actor.system.stats || {};
      let statValue = Number(stats[stat]);
      let idx = dieSteps.indexOf(statValue);
      if (idx === -1) idx = 0;
      if (idx > 0) {
        await this.actor.update({[`system.stats.${stat}`]: dieSteps[idx - 1]});
        this.render();
      }
    });
    // Other listeners
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

    // Dice blow-up mechanic for stats
    html.find('.stat-roll').on('click', async (event) => {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const stats = this.actor.system.stats || {};
      let statValue = Number(stats[stat]);
      if (!statValue || ![4,6,8,10,12,20].includes(statValue)) statValue = 4;
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

class NSBUGroupAbilitySheet extends ItemSheet {
  getData(options) {
    const data = super.getData(options);
    data.system = this.item.system ?? {};
    console.log("Group Ability Sheet Data:", data);
    return data;
  }
  
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["never-stop-blowing-up", "sheet", "group-ability"],
      template: "systems/never-stop-blowing-up/templates/group-ability-sheet.html",
      width: 450,
      height: 400
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
      },
      "group-ability": {
        system: {
          groupSuite: { type: String, default: "" },
          dieRequirement: { type: String, default: "" },
          effect: { type: String, default: "" },
          frequency: { type: String, default: "" },
          folder: { type: String, default: "" }
        }
      }
    }
  };

  // Register the custom actor sheets
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("never-stop-blowing-up", NSBUActorSheet, {
    types: ["character"],
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
  
  // Register the custom group ability sheet
  Items.registerSheet("never-stop-blowing-up", NSBUGroupAbilitySheet, {
    types: ["group-ability"],
    makeDefault: true
  });
});

Hooks.once('setup', async function() {
  // Log all compendium packs
  console.log("=== NSBU COMPENDIUM DEBUG ===");
  console.log("Compendium Packs Loaded:");
  for (let pack of game.packs) {
    console.log(`Pack: ${pack.collection} | Label: ${pack.metadata.label} | Type: ${pack.metadata.type}`);
    
    // Debug the group abilities compendium specifically
    if (pack.collection === "never-stop-blowing-up.group-abilities") {
      console.log("=== GROUP ABILITIES COMPENDIUM DEBUG ===");
      
      try {
        // Get the index first
        const index = await pack.getIndex();
        console.log("Group Abilities Index:", index);
        console.log(`Index contains ${index.size} entries`);
        
        // Log each index entry
        index.forEach((entry, id) => {
          console.log(`Index Entry [${id}]:`, {
            name: entry.name,
            type: entry.type,
            folder: entry.folder,
            sort: entry.sort
          });
        });
        
        // Get all documents
        const docs = await pack.getDocuments();
        console.log(`Loaded ${docs.length} documents from compendium`);
        
        // Separate folders and items
        const folders = docs.filter(doc => doc.type === "Folder" || doc.documentName === "Folder");
        const items = docs.filter(doc => doc.type === "group-ability" || doc.documentName === "Item");
        
        console.log(`Found ${folders.length} folders and ${items.length} items`);
        
        // Log folder details
        console.log("=== FOLDERS ===");
        folders.forEach(folder => {
          console.log(`Folder [${folder.id}]:`, {
            name: folder.name,
            type: folder.type,
            documentName: folder.documentName,
            sort: folder.sort
          });
        });
        
        // Log item details
        console.log("=== ITEMS ===");
        items.forEach(item => {
          console.log(`Item [${item.id}]:`, {
            name: item.name,
            type: item.type,
            documentName: item.documentName,
            folder: item.folder,
            system: item.system,
            sort: item.sort
          });
        });
        
        // Check for orphaned items (items without valid folder references)
        const folderIds = new Set(folders.map(f => f.id));
        const orphanedItems = items.filter(item => item.folder && !folderIds.has(item.folder));
        if (orphanedItems.length > 0) {
          console.warn("Orphaned items (invalid folder references):", orphanedItems.map(i => i.name));
        }
        
        // CREATE MISSING FOLDERS DYNAMICALLY
        if (folders.length === 0 && items.length > 0) {
          console.log("=== CREATING MISSING FOLDERS ===");
          
          // Get unique folder names from items
          const folderMap = new Map();
          items.forEach(item => {
            if (item.system?.folder) {
              folderMap.set(item.system.folder, []);
            }
          });
          
          console.log("Folders to create:", Array.from(folderMap.keys()));
          
          // This would need to be done differently since we can't modify compendium content at runtime
          // Instead, let's organize items by their system.folder for display purposes
          const itemsByFolder = new Map();
          items.forEach(item => {
            const folderName = item.system?.folder || "Uncategorized";
            if (!itemsByFolder.has(folderName)) {
              itemsByFolder.set(folderName, []);
            }
            itemsByFolder.get(folderName).push(item);
          });
          
          console.log("Items organized by folder:");
          itemsByFolder.forEach((folderItems, folderName) => {
            console.log(`  ${folderName}: ${folderItems.length} items`);
          });
        }
        
      } catch (error) {
        console.error("Error loading group abilities compendium:", error);
      }
    }
    
    // Also debug the regular abilities compendium
    if (pack.collection === "never-stop-blowing-up.abilities") {
      try {
        const index = await pack.getIndex();
        console.log("Player Abilities Compendium Index:", index);
        const docs = await pack.getDocuments();
        console.log("Player Abilities Documents:", docs);
      } catch (error) {
        console.error("Error loading abilities compendium:", error);
      }
    }
  }
  
  console.log("=== END COMPENDIUM DEBUG ===");
});
