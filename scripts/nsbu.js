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

// Global handler for turbo token buttons in chat messages
$(document).on('click', '.add-tokens-btn', async function(event) {
  // Prevent multiple rapid clicks
  if ($(this).prop('disabled')) return;
  $(this).prop('disabled', true);
  
  const rollId = $(this).data('roll-id');
  const actorId = $(this).data('actor-id');
  const stat = $(this).data('stat');
  const originalTotal = parseInt($(this).data('original-total'));
  const lastDie = parseInt($(this).data('last-die'));
  const lastValue = parseInt($(this).data('last-value'));
  const currentDieIdx = parseInt($(this).data('die-idx'));
  
  const tokensToAdd = parseInt($(this).siblings('.token-input').val()) || 0;
  
  if (tokensToAdd <= 0) {
    ui.notifications.warn("Please enter a number of tokens to add.");
    return;
  }
  
  const actor = game.actors.get(actorId);
  if (!actor) return;
  
  const currentTokens = Number(actor.system.turboTokens) || 0;
  if (tokensToAdd > currentTokens) {
    ui.notifications.warn("Not enough Turbo Tokens available.");
    return;
  }
  
  // Calculate new total and check for blow-up
  const newLastValue = lastValue + tokensToAdd;
  const newTotal = originalTotal + tokensToAdd;
  let dieIdx = currentDieIdx;
  const dieSteps = [4, 6, 8, 10, 12, 20];
  
  // Update the chat message display
  const rollElement = $(this).closest('.nsbu-roll-result');
  rollElement.find('.current-total').text(newTotal);
  
  // Check if tokens trigger a blow-up
  let blowUpTriggered = false;
  let finalNotification = `Added ${tokensToAdd} Turbo Tokens to roll!`;
  
  if (newLastValue >= lastDie && dieIdx < dieSteps.length - 1) {
    blowUpTriggered = true;
    const originalDieIdx = dieIdx;
    
    // Continue blow-up chain
    let blowUpTotal = newTotal;
    let rolls = [`d${lastDie}: ${lastValue} + ${tokensToAdd} tokens = ${newLastValue}`];
    
    do {
      dieIdx++;
      const currentDie = dieSteps[dieIdx];
      const roll = new Roll(`1d${currentDie}`);
      await roll.evaluate();
      const value = roll.total;
      rolls.push(`d${currentDie}: ${value}`);
      blowUpTotal += value;
      
      if (value < currentDie || dieIdx >= dieSteps.length - 1) break;
    } while (true);
    
    // Update display with blow-up results
    rollElement.find('.roll-details').html(rolls.join(' + '));
    rollElement.find('.current-total').text(blowUpTotal);
    
    // Update actor's stat if it blew up (only once)
    if (dieIdx > originalDieIdx) {
      await actor.update({[`system.stats.${stat}`]: dieSteps[dieIdx]});
      finalNotification += ` Blow-up triggered! ${stat.toUpperCase()} upgraded to d${dieSteps[dieIdx]}!`;
    } else {
      finalNotification += ` Blow-up triggered!`;
    }
  } else {
    // Just update the display with added tokens
    const rollDetails = rollElement.find('.roll-details');
    const currentText = rollDetails.text();
    const newText = currentText.replace(/d\d+: \d+$/, `d${lastDie}: ${lastValue} + ${tokensToAdd} tokens = ${newLastValue}`);
    rollDetails.html(newText);
  }
  
  // Spend the turbo tokens
  await actor.update({ 'system.turboTokens': currentTokens - tokensToAdd });
  
  // Remove the turbo token controls
  $(this).closest('.turbo-tokens-section').remove();
});

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
      const originalDieIdx = dieIdx;
      let currentDie = dieSteps[dieIdx];
      let total = 0;
      let rolls = [];
      let blowUp = false;
      do {
        const roll = new Roll(`1d${currentDie}`);
        await roll.evaluate();
        const value = roll.total;
        rolls.push({value: value, die: currentDie});
        total += value;
        blowUp = (value === currentDie) && (dieIdx < dieSteps.length - 1);
        if (blowUp) {
          dieIdx++;
          currentDie = dieSteps[dieIdx];
        }
      } while (blowUp);
      
      // Create interactive dice roll message
      await createInteractiveDiceRoll(this.actor, stat, rolls, total, dieIdx, originalDieIdx);
      
      // If the die blew up, update the stat to the new die
      if (dieIdx > originalDieIdx) {
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
    // Injury increase button
    html.find('.injury-increase').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.injuries) || 0;
      if (current < 3) {
        const newInjuries = current + 1;
        const updateData = { 'system.injuries': newInjuries };
        
        // If reaching "Adrenalized" (3), add 10 turbo tokens
        if (newInjuries === 3) {
          const currentTokens = Number(this.actor.system.turboTokens) || 0;
          updateData['system.turboTokens'] = currentTokens + 10;
          ui.notifications.info("Adrenalized! Gained 10 Turbo Tokens!");
        }
        
        await this.actor.update(updateData);
        this.render();
      }
    });
    // Injury decrease button
    html.find('.injury-decrease').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.injuries) || 0;
      if (current > 0) {
        await this.actor.update({ 'system.injuries': current - 1 });
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
      const originalDieIdx = dieIdx;
      let currentDie = dieSteps[dieIdx];
      let total = 0;
      let rolls = [];
      let blowUp = false;
      do {
        const roll = new Roll(`1d${currentDie}`);
        await roll.evaluate();
        const value = roll.total;
        rolls.push({value: value, die: currentDie});
        total += value;
        blowUp = (value === currentDie) && (dieIdx < dieSteps.length - 1);
        if (blowUp) {
          dieIdx++;
          currentDie = dieSteps[dieIdx];
        }
      } while (blowUp);
      
      // Create interactive dice roll message
      await createInteractiveDiceRoll(this.actor, stat, rolls, total, dieIdx, originalDieIdx);
      
      // If the die blew up, update the stat to the new die
      if (dieIdx > originalDieIdx) {
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
    // Injury increase button
    html.find('.injury-increase').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.injuries) || 0;
      if (current < 3) {
        await this.actor.update({ 'system.injuries': current + 1 });
        this.render();
      }
    });
    // Injury decrease button
    html.find('.injury-decrease').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.injuries) || 0;
      if (current > 0) {
        await this.actor.update({ 'system.injuries': current - 1 });
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
  // Register Handlebars helper to strip numeric prefixes from names
  Handlebars.registerHelper('stripSortPrefix', function(name) {
    if (typeof name === 'string') {
      return name.replace(/^\d+\s/, '');
    }
    return name;
  });

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
          injuries: { type: Number, default: 0 },
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
          injuries: { type: Number, default: 0 },
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

  // Add initialization logging
  console.log("=== NSBU SYSTEM INIT ===");
  console.log("Sheets registered successfully!");
});

Hooks.once('setup', async function() {
  // Basic compendium verification
  console.log("=== NSBU SYSTEM LOADED ===");
  console.log("Total packs available:", game.packs.size);
  console.log("System packs registered in system.json:");
  
  // Log all system-defined packs (safely)
  if (game.system?.packs) {
    console.log("Packs from system.json:", game.system.packs);
  } else {
    console.log("System packs not available or undefined");
  }
  
  console.log("Compendium Packs Available:");
  for (let pack of game.packs) {
    if (pack.collection.startsWith("never-stop-blowing-up")) {
      console.log(`✓ ${pack.metadata?.label || 'Unknown'} (${pack.collection})`);
      
      // Quick verification for group abilities
      if (pack.collection === "never-stop-blowing-up.group-abilities") {
        try {
          const index = await pack.getIndex();
          console.log(`  - Contains ${index.size} group abilities organized by die size`);
          
          // Sample a few entries to verify the new naming
          const sampleEntries = Array.from(index.values()).slice(0, 3);
          console.log("  - Sample entries:");
          sampleEntries.forEach(entry => {
            console.log(`    • ${entry.name}`);
          });
        } catch (error) {
          console.error("  - Error loading group abilities:", error);
        }
      }
      
      if (pack.collection === "never-stop-blowing-up.abilities") {
        try {
          const index = await pack.getIndex();
          console.log(`  - Contains ${index.size} player abilities`);
        } catch (error) {
          console.error("  - Error loading player abilities:", error);
        }
      }
      
      if (pack.collection === "never-stop-blowing-up.rules-reference") {
        try {
          console.log("  - Rules reference compendium found! Attempting to load...");
          const index = await pack.getIndex();
          console.log(`  - Contains ${index.size} rules reference entries`);
          console.log("  - Rules reference compendium loaded successfully");
          
          // Log the entries
          const entries = Array.from(index.values());
          entries.forEach(entry => {
            console.log(`    • ${entry.name} (${entry.type})`);
          });
        } catch (error) {
          console.error("  - Error loading rules reference:", error);
          console.error("  - Error details:", error.stack);
        }
      }
      
      if (pack.collection === "never-stop-blowing-up.test-rules") {
        try {
          console.log("  - Test rules compendium found! Attempting to load...");
          const index = await pack.getIndex();
          console.log(`  - Contains ${index.size} rules reference entries`);
          console.log("  - Test rules compendium loaded successfully");
          
          // Log the entries
          const entries = Array.from(index.values());
          entries.forEach(entry => {
            console.log(`    • ${entry.name} (${entry.type})`);
          });
        } catch (error) {
          console.error("  - Error loading test rules:", error);
          console.error("  - Error details:", error.stack);
        }
      }
    }
  }
  
  // Also check if the packs exist in the system definition
  console.log("Checking system-defined packs:");
  if (game.system?.packs) {
    const systemPacks = Array.from(game.system.packs);
    systemPacks.forEach(pack => {
      console.log(`  - System pack: ${pack.name} (${pack.label || 'Unknown'}) - Type: ${pack.type || 'Unknown'}`);
      if (pack.name === "rules-reference") {
        console.log("    → Rules reference pack is defined in system.json");
      }
    });
  } else {
    console.log("System packs definition not available");
  }
  console.log("=== SYSTEM READY ===");
});

// Helper function to create interactive dice roll chat messages
async function createInteractiveDiceRoll(actor, stat, rolls, total, dieIdx, originalDieIdx) {
  const rollId = foundry.utils.randomID();
  const turboTokens = Number(actor.system.turboTokens) || 0;
  const lastRoll = rolls[rolls.length - 1];
  
  const chatContent = `
    <div class="nsbu-roll-result" data-roll-id="${rollId}" style="border: 1px solid #ddd; padding: 10px; margin: 5px 0;">
      <div class="roll-header" style="font-weight: bold; margin-bottom: 5px;">
        ${stat.toUpperCase()} Roll
      </div>
      <div class="roll-details" style="margin-bottom: 5px;">
        ${rolls.map(r => `<span class="die-roll" style="background: #f0f0f0; padding: 2px 6px; margin: 2px; border-radius: 3px;">d${r.die}: ${r.value}</span>`).join(' + ')}
      </div>
      <div class="roll-total" style="font-weight: bold; font-size: 1.2em; margin-bottom: 10px;">
        Total: <span class="current-total">${total}</span>
      </div>
      ${turboTokens > 0 ? `
        <div class="turbo-tokens-section" style="background: #f9f9f9; padding: 8px; border-radius: 5px;">
          <label style="font-weight: bold;">Add Turbo Tokens:</label>
          <div class="token-controls" style="margin: 5px 0;">
            <input type="number" class="token-input" min="0" max="${turboTokens}" value="0" style="width: 4em; margin-right: 5px;">
            <button type="button" class="add-tokens-btn" 
                    data-roll-id="${rollId}" 
                    data-actor-id="${actor.id}" 
                    data-stat="${stat}" 
                    data-original-total="${total}" 
                    data-last-die="${lastRoll.die}" 
                    data-last-value="${lastRoll.value}" 
                    data-die-idx="${dieIdx}"
                    data-original-die-idx="${originalDieIdx}"
                    style="padding: 4px 8px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Add Tokens
            </button>
          </div>
          <div class="tokens-available" style="font-size: 0.9em; color: #666;">Available: ${turboTokens} tokens</div>
        </div>
      ` : ''}
    </div>
  `;
  
  await ChatMessage.create({
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({actor}),
    content: chatContent,
    flavor: `${stat.toUpperCase()} roll result`
  });
}
}
}
