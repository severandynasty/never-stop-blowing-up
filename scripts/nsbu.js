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

// Global handler for accept roll button - using namespace to prevent duplicates
$(document).off('click.nsbu-accept', '.accept-roll-btn');
$(document).on('click.nsbu-accept', '.accept-roll-btn', async function(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const $button = $(this);
  
  // Check if already processing
  if ($button.prop('disabled') || $button.hasClass('processing')) {
    console.log('🚫 Accept roll button already processing, ignoring click');
    return;
  }
  
  // Mark as processing immediately
  $button.addClass('processing').prop('disabled', true);
  
  const finalTotal = parseInt($(this).data('final-total'));
  
  // Update the chat message display
  const rollElement = $(this).closest('.nsbu-roll-result');
  rollElement.find('.roll-details').append(' → ACCEPTED');
  
  // Remove the roll controls
  $(this).closest('.roll-controls').remove();
  
  // Add final result display
  rollElement.append(`<div class="final-result">Final Result: ${finalTotal}</div>`);
});

// Global handler for adding tokens to current die - using namespace to prevent duplicates
$(document).off('click.nsbu-tokens', '.add-tokens-to-die-btn');
$(document).on('click.nsbu-tokens', '.add-tokens-to-die-btn', async function(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const $button = $(this);
  
  // Check if already processing
  if ($button.prop('disabled') || $button.hasClass('processing')) {
    console.log('🚫 Add tokens button already processing, ignoring click');
    return;
  }
  
  // Mark as processing immediately
  $button.addClass('processing').prop('disabled', true);
  
  console.log('💰 Add tokens button clicked - processing...');
  
  const rollId = $(this).data('roll-id');
  const actorId = $(this).data('actor-id');
  const stat = $(this).data('stat');
  const dieValue = parseInt($(this).data('die-value'));
  const currentDie = parseInt($(this).data('current-die'));
  const currentDieIdx = parseInt($(this).data('current-die-idx'));
  
  const tokensToAdd = parseInt($(this).siblings('.token-input').val()) || 0;
  
  if (tokensToAdd <= 0) {
    $button.prop('disabled', false);
    return;
  }
  
  const actor = game.actors.get(actorId);
  if (!actor) {
    $button.prop('disabled', false);
    return;
  }
  
  const currentTokens = Number(actor.system.turboTokens) || 0;
  if (tokensToAdd > currentTokens) {
    $button.prop('disabled', false);
    return;
  }
  
  // Calculate new die result
  const newDieResult = dieValue + tokensToAdd;
  const dieSteps = [4, 6, 8, 10, 12, 20];
  
  console.log(`💰 DEBUG: Token blow-up - ${dieValue} + ${tokensToAdd} tokens = ${newDieResult} on d${currentDie}`);
  
  // Spend the turbo tokens
  await actor.update({ 'system.turboTokens': currentTokens - tokensToAdd });
  
  // Update the chat message display
  const rollElement = $(this).closest('.nsbu-roll-result');
  rollElement.find('.roll-details').html(`Rolling ${stat.toUpperCase()} (d${currentDie}): ${dieValue} + ${tokensToAdd} tokens = ${newDieResult}`);
  rollElement.find('.current-total').text(newDieResult);
  
  // Remove current controls immediately to prevent multiple clicks - but only if they still exist
  const controlsElement = $(this).closest('.roll-controls');
  if (controlsElement.length > 0) {
    controlsElement.remove();
    console.log('🗑️ DEBUG: Roll controls removed');
  } else {
    console.log('⚠️ DEBUG: Roll controls already removed!');
  }
  
  // Check if we hit the die maximum (blow-up)
  if (newDieResult >= currentDie) {
    console.log(`💥 DEBUG: Token blow-up triggered! ${newDieResult} >= ${currentDie}`);
    
    // BLOW UP! Advance to next die
    if (currentDieIdx < dieSteps.length - 1) {
      const newDieIdx = currentDieIdx + 1;
      const newDie = dieSteps[newDieIdx];
      
      console.log(`💥 DEBUG: Upgrading stat from d${currentDie} to d${newDie} due to token blow-up`);
      
      // Update actor's stat
      await actor.update({[`system.stats.${stat}`]: newDie});
      
      // Add blow-up notice
      rollElement.append(`<div class="blow-up-notice">🎯 BLOW UP! ${newDieResult} hits d${currentDie} maximum! ${stat.toUpperCase()} upgraded to d${newDie}!</div>`);
      
      console.log(`💥 DEBUG: Calling createInteractiveDiceRoll for upgraded d${newDie}`);
      
      // Create a completely new roll for the next die instead of continuing in same message
      await createInteractiveDiceRoll(actor, stat, newDie);
    } else {
      // Already at maximum die (d20)
      rollElement.append(`<div class="final-result">Final Result: ${newDieResult} (Maximum die reached!)</div>`);
    }
  } else {
    // No blow-up, just final result
    rollElement.append(`<div class="final-result">Final Result: ${newDieResult}</div>`);
  }
});

// Helper function to create interactive dice roll
async function createInteractiveDiceRoll(actor, stat, statValue) {
  console.log(`🎲 DEBUG: createInteractiveDiceRoll called - actor: ${actor.name}, stat: ${stat}, statValue: ${statValue}`);
  
  const dieSteps = [4, 6, 8, 10, 12, 20];
  let dieIdx = dieSteps.indexOf(statValue);
  if (dieIdx === -1) dieIdx = 0;
  
  let currentDie = dieSteps[dieIdx];
  
  console.log(`🎲 DEBUG: Rolling d${currentDie} (index ${dieIdx})`);
  
  // Roll the current die
  const roll = new Roll(`1d${currentDie}`, {}, {async: false});
  await roll.evaluate();
  const rollValue = roll.total;
  
  console.log(`🎲 DEBUG: Roll result: ${rollValue} on d${currentDie}`);
  
  // Create the interactive chat message
  const rollId = foundry.utils.randomID();
  const currentTokens = Number(actor.system.turboTokens) || 0;
  
  // Check if this is a natural maximum (automatic blow-up)
  const isNaturalMax = (rollValue === currentDie);
  
  console.log(`🎲 DEBUG: isNaturalMax: ${isNaturalMax}, currentTokens: ${currentTokens}`);
  
  let content;
  if (isNaturalMax) {
    // Natural maximum - automatically trigger blow-up
    content = `
      <div class="nsbu-roll-result" data-roll-id="${rollId}">
        <div class="roll-details">Rolling ${stat.toUpperCase()} (d${currentDie}): ${rollValue}</div>
        <div class="roll-total">Current Result: <span class="current-total">${rollValue}</span></div>
        <div class="natural-max-notice">🎯 Natural ${rollValue}! Automatic blow-up triggered!</div>
      </div>
    `;
    
    // Create the message first
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${stat.toUpperCase()} Roll (d${currentDie}) - NATURAL BLOW-UP!`,
      content: content,
      rolls: [roll],
      rollMode: game.settings.get("core", "rollMode"),
      sound: null
    };
    
    const message = await ChatMessage.create(chatData);
    console.log(`🎯 DEBUG: Natural blow-up message created`);
    
    // Then immediately continue with the blow-up sequence
    if (dieIdx < dieSteps.length - 1) {
      const newDieIdx = dieIdx + 1;
      const newDie = dieSteps[newDieIdx];
      
      console.log(`🎯 DEBUG: Upgrading stat from d${currentDie} to d${newDie}`);
      
      // Update actor's stat
      await actor.update({[`system.stats.${stat}`]: newDie});
      
      console.log(`🎯 DEBUG: Stat upgraded, calling createInteractiveDiceRoll recursively for d${newDie}`);
      
      // Create a new roll for the upgraded stat (recursive call)
      await createInteractiveDiceRoll(actor, stat, newDie);
    } else {
      console.log(`🎯 DEBUG: Maximum die reached (d20), creating final message`);
      // Already at maximum die (d20) - create final message
      const finalContent = `
        <div class="nsbu-roll-result">
          <div class="final-result">Final Result: ${rollValue} (Maximum die reached!)</div>
        </div>
      `;
      
      const finalChatData = {
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor }),
        flavor: `${stat.toUpperCase()} Final Result`,
        content: finalContent,
        rollMode: game.settings.get("core", "rollMode"),
        sound: null
      };
      
      await ChatMessage.create(finalChatData);
    }
    
  } else {
    // Normal roll - show accept and token options
    content = `
      <div class="nsbu-roll-result" data-roll-id="${rollId}">
        <div class="roll-details">Rolling ${stat.toUpperCase()} (d${currentDie}): ${rollValue}</div>
        <div class="roll-total">Current Result: <span class="current-total">${rollValue}</span></div>
        <div class="roll-controls">
          <button type="button" class="accept-roll-btn" 
            data-roll-id="${rollId}"
            data-actor-id="${actor.id}"
            data-stat="${stat}"
            data-final-total="${rollValue}"
            data-current-die-idx="${dieIdx}">Accept Roll (${rollValue})</button>
          ${currentTokens > 0 ? `
          <div class="turbo-tokens-section">
            <div class="turbo-tokens-controls">
              <label>Add Turbo Tokens to this d${currentDie} roll (${currentTokens} available):</label>
              <input type="number" class="token-input" min="0" max="${currentTokens}" value="0">
              <button type="button" class="add-tokens-to-die-btn" 
                data-roll-id="${rollId}"
                data-actor-id="${actor.id}"
                data-stat="${stat}"
                data-die-value="${rollValue}"
                data-current-die="${currentDie}"
                data-current-die-idx="${dieIdx}">Add Tokens to d${currentDie}</button>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${stat.toUpperCase()} Roll (d${currentDie})`,
      content: content,
      rolls: [roll],
      rollMode: game.settings.get("core", "rollMode"),
      sound: null
    };
    
    await ChatMessage.create(chatData);
  }
}

Hooks.once('ready', async function() {
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

    // Dice blow-up mechanic for stats
    html.find('.stat-roll').on('click', async (event) => {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const stats = this.actor.system.stats || {};
      let statValue = Number(stats[stat]);
      if (!statValue || ![4,6,8,10,12,20].includes(statValue)) statValue = 4;
      
      await createInteractiveDiceRoll(this.actor, stat, statValue);
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

    // Dice blow-up mechanic for stats
    html.find('.stat-roll').on('click', async (event) => {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const stats = this.actor.system.stats || {};
      let statValue = Number(stats[stat]);
      if (!statValue || ![4,6,8,10,12,20].includes(statValue)) statValue = 4;
      
      await createInteractiveDiceRoll(this.actor, stat, statValue);
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

// Add early initialization hook to catch pack loading issues
Hooks.once('init', function() {
  console.log("=== NSBU SYSTEM INIT ===");
  
  // Check system information that's available at init
  if (game.system) {
    console.log("System ID:", game.system.id);
    console.log("System title:", game.system.title);
    
    // Check if packs property exists
    if (game.system.packs) {
      console.log("System packs from config:", game.system.packs);
    } else {
      console.log("System packs not yet available at init");
    }
  }
  
  // Check game packs collection
  if (game.packs) {
    console.log("Game packs collection size:", game.packs.size);
    console.log("Available pack collections:");
    for (let pack of game.packs) {
      console.log(`  - ${pack.collection} (${pack.metadata?.label || 'Unknown'}) - Type: ${pack.metadata?.type || 'Unknown'}`);
    }
  } else {
    console.log("Game packs collection not yet available");
  }
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
