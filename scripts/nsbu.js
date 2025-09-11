// Track active roll sequences to prevent race conditions
const activeRollSequences = new Map();

// Setup global event handlers when Foundry is ready
Hooks.once('ready', function() {
  console.log("=== Setting up NSBU global event handlers ===");
  
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
    const actorId = $(this).data('actor-id');
    const stat = $(this).data('stat');
    const rollSequenceId = $(this).data('sequence-id');
    
    // Clear the active roll sequence
    if (rollSequenceId && actorId && stat) {
      const sequenceKey = `${actorId}-${stat}`;
      activeRollSequences.delete(sequenceKey);
      console.log(`🔓 DEBUG: Cleared roll sequence ${rollSequenceId} for ${stat} (accepted)`);
    }
    
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
    const cumulativeTotal = parseInt($(this).data('cumulative-total')) || 0;
    const rollSequenceId = $(this).data('sequence-id');
    
    console.log(`💰 DEBUG: Token handler - sequenceId: ${rollSequenceId}, cumulative: ${cumulativeTotal}`);
    
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
    
    // Calculate new cumulative total including these tokens
    const tokensOnlyTotal = cumulativeTotal - dieValue; // Remove the current die from cumulative
    const newCumulativeTotal = tokensOnlyTotal + newDieResult; // Add the die + tokens result
    
    console.log(`💰 DEBUG: Token blow-up - ${dieValue} + ${tokensToAdd} tokens = ${newDieResult} on d${currentDie}`);
    console.log(`📊 DEBUG: Updated cumulative total: ${cumulativeTotal} -> ${newCumulativeTotal}`);
    
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
        
        console.log(`💥 DEBUG: Calling createInteractiveDiceRoll for upgraded d${newDie}, sequenceId: ${rollSequenceId}`);
        
        // Create a completely new roll for the next die instead of continuing in same message
        await createInteractiveDiceRoll(actor, stat, newDie, newCumulativeTotal, rollSequenceId);
      } else {
        // Already at maximum die (d20)
        rollElement.append(`<div class="final-result">Final Result: ${newCumulativeTotal} (Maximum die reached!)</div>`);
        
        // Clear the roll sequence as it's complete
        const sequenceKey = `${actor.id}-${stat}`;
        activeRollSequences.delete(sequenceKey);
        console.log(`🔓 DEBUG: Cleared roll sequence ${rollSequenceId} for ${stat} (max die reached)`);
      }
    } else {
      // No blow-up, just final result
      rollElement.append(`<div class="final-result">Final Result: ${newCumulativeTotal}</div>`);
      
      // Clear the roll sequence as it's complete
      const sequenceKey = `${actor.id}-${stat}`;
      activeRollSequences.delete(sequenceKey);
      console.log(`🔓 DEBUG: Cleared roll sequence ${rollSequenceId} for ${stat} (no blow-up)`);
    }
  });
  
  console.log("=== NSBU global event handlers setup complete ===");
});

// Helper function to create interactive dice roll
async function createInteractiveDiceRoll(actor, stat, statValue, cumulativeTotal = 0, rollSequenceId = null) {
  console.log('🎲🎲🎲 DEBUG: createInteractiveDiceRoll ENTRY POINT', {
    actorName: actor?.name,
    actorId: actor?.id,
    stat: stat,
    statValue: statValue,
    cumulativeTotal: cumulativeTotal,
    rollSequenceId: rollSequenceId
  });
  
  // Generate a unique sequence ID for this roll chain if not provided
  if (!rollSequenceId) {
    rollSequenceId = foundry.utils.randomID();
    
    // Check if there's already an active sequence for this actor+stat
    const sequenceKey = `${actor.id}-${stat}`;
    if (activeRollSequences.has(sequenceKey)) {
      console.log(`🚫 DEBUG: Roll sequence already active for ${actor.name} ${stat}, ignoring new roll`);
      return;
    }
    
    // Mark this sequence as active
    activeRollSequences.set(sequenceKey, rollSequenceId);
    console.log(`🔒 DEBUG: Started new roll sequence ${rollSequenceId} for ${actor.name} ${stat}`);
  }
  
  console.log(`🎲 DEBUG: createInteractiveDiceRoll called - actor: ${actor.name}, stat: ${stat}, statValue: ${statValue}, cumulativeTotal: ${cumulativeTotal}, sequenceId: ${rollSequenceId}`);
  
  const dieSteps = [4, 6, 8, 10, 12, 20];
  let dieIdx = dieSteps.indexOf(statValue);
  if (dieIdx === -1) dieIdx = 0;
  
  let currentDie = dieSteps[dieIdx];
  
  console.log(`🎲 DEBUG: Rolling d${currentDie} (index ${dieIdx})`);
  
  // Create and evaluate the roll
  const roll = new Roll(`1d${currentDie}`);
  await roll.evaluate();
  const rollValue = roll.total;
  
  console.log(`🎲 DEBUG: Roll result: ${rollValue} on d${currentDie}`);
  
  // Update cumulative total with this roll
  const newCumulativeTotal = cumulativeTotal + rollValue;
  console.log(`📊 DEBUG: Cumulative total: ${cumulativeTotal} + ${rollValue} = ${newCumulativeTotal}`);
  
  // Create the interactive chat message
  const rollId = foundry.utils.randomID();
  const currentTokens = Number(actor.system.turboTokens) || 0;
  
  // Check if this is a natural maximum (automatic blow-up)
  const isNaturalMax = (rollValue === currentDie);
  
  console.log(`🎲 DEBUG: isNaturalMax: ${isNaturalMax}, currentTokens: ${currentTokens}`);
  
  let content;
  if (isNaturalMax) {
    // Natural maximum - automatic blow-up
    content = `
      <div class="nsbu-roll-result" data-roll-id="${rollId}">
        <div class="roll-details">Rolling ${stat.toUpperCase()} (d${currentDie}): ${rollValue} 🎯 NATURAL MAX!</div>
        <div class="natural-max-notice">🎯 Natural Maximum! Automatic blow-up!</div>
      </div>
    `;
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${stat.toUpperCase()} Natural Blow-up!`,
      content: content,
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
      
      console.log(`🎯 DEBUG: Stat upgraded, calling createInteractiveDiceRoll recursively for d${newDie}, sequenceId: ${rollSequenceId}`);
      
      // Create a new roll for the upgraded stat (recursive call)
      await createInteractiveDiceRoll(actor, stat, newDie, newCumulativeTotal, rollSequenceId);
    } else {
      console.log(`🎯 DEBUG: Maximum die reached (d20), creating final message`);
      // Already at maximum die (d20) - create final message
      const finalContent = `
        <div class="nsbu-roll-result">
          <div class="final-result">Final Result: ${newCumulativeTotal} (Maximum die reached!)</div>
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
      
      // Clear the roll sequence as it's complete
      const sequenceKey = `${actor.id}-${stat}`;
      activeRollSequences.delete(sequenceKey);
      console.log(`🔓 DEBUG: Cleared roll sequence ${rollSequenceId} for ${stat} (natural max die reached)`);
    }
    
  } else {
    // Normal roll - show accept and token options
    content = `
      <div class="nsbu-roll-result" data-roll-id="${rollId}">
        <div class="roll-details">Rolling ${stat.toUpperCase()} (d${currentDie}): ${rollValue}</div>
        <div class="roll-total">
          Current Die: <span class="current-die-total">${rollValue}</span>
          ${cumulativeTotal > 0 ? `<br/>Cumulative Total: <span class="cumulative-total">${newCumulativeTotal}</span>` : ''}
        </div>
        <div class="roll-controls">
          <button type="button" class="accept-roll-btn" 
            data-roll-id="${rollId}"
            data-actor-id="${actor.id}"
            data-stat="${stat}"
            data-final-total="${newCumulativeTotal}"
            data-current-die-idx="${dieIdx}"
            data-sequence-id="${rollSequenceId}">Accept Roll (Total: ${newCumulativeTotal})</button>
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
                data-current-die-idx="${dieIdx}"
                data-cumulative-total="${newCumulativeTotal}"
                data-sequence-id="${rollSequenceId}">Add Tokens to d${currentDie}</button>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
    
    const chatData = {
      user: game.user.id,
      speaker: ChatMessage.getSpeaker({ actor }),
      flavor: `${stat.toUpperCase()} Roll`,
      content: content,
      rolls: [roll],
      rollMode: game.settings.get("core", "rollMode"),
      sound: CONFIG.sounds.dice
    };
    
    await ChatMessage.create(chatData);
  }
}

class NSBUActorSheet extends ActorSheet {
  activateListeners(html) {
    console.log('🎭 DEBUG: NSBUActorSheet.activateListeners() called');
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
    
    // Turbo token increase button
    html.find('.token-increase').on('click', async (event) => {
      event.preventDefault();
      const current = Number(this.actor.system.turboTokens) || 0;
      await this.actor.update({ 'system.turboTokens': current + 1 });
      this.render();
    });
    
    // Turbo token decrease button
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
    
    // Roll stat buttons - ACTOR SHEET
    console.log('🎲 DEBUG: NSBUActorSheet - Setting up .roll-stat click handler');
    const rollStatButtons = html.find('.roll-stat');
    console.log('🎲 DEBUG: NSBUActorSheet - Found roll-stat buttons:', rollStatButtons.length);
    
    rollStatButtons.on('click', async (event) => {
      console.log('🎲 DEBUG: NSBUActorSheet - Roll stat button clicked!', event);
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      console.log('🎲 DEBUG: NSBUActorSheet - Stat from button:', stat);
      const stats = this.actor.system.stats || {};
      console.log('🎲 DEBUG: NSBUActorSheet - Actor stats:', stats);
      let statValue = Number(stats[stat]);
      console.log('🎲 DEBUG: NSBUActorSheet - Stat value:', statValue);
      if (!statValue || ![4,6,8,10,12,20].includes(statValue)) {
        console.log('🎲 DEBUG: NSBUActorSheet - Invalid stat value, defaulting to 4');
        statValue = 4;
      }
      
      console.log('🎲 DEBUG: NSBUActorSheet - About to call createInteractiveDiceRoll with:', {
        actor: this.actor.name,
        stat: stat,
        statValue: statValue
      });
      
      try {
        await createInteractiveDiceRoll(this.actor, stat, statValue);
        console.log('🎲 DEBUG: NSBUActorSheet - createInteractiveDiceRoll completed successfully');
      } catch (error) {
        console.error('🎲 ERROR: NSBUActorSheet - createInteractiveDiceRoll failed:', error);
      }
    });
    
    // Other input listeners
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
    
    // Roll stat buttons
    html.find('.roll-stat').on('click', async (event) => {
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      const stats = this.actor.system.stats || {};
      let statValue = Number(stats[stat]);
      if (!statValue || ![4,6,8,10,12,20].includes(statValue)) statValue = 4;
      
      await createInteractiveDiceRoll(this.actor, stat, statValue);
    });
    
    // Other input listeners
    html.find('input, select, textarea').on('change blur', async (event) => {
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
  }

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
    return data;
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["never-stop-blowing-up", "sheet", "group-ability"],
      template: "systems/never-stop-blowing-up/templates/group-ability-sheet.html",
      width: 400,
      height: 300
    });
  }
}

Hooks.once("init", () => {
  console.log("=== NSBU SYSTEM INIT ===");
  
  // Check system information that's available at init
  console.log("System ID:", game.system.id);
  console.log("System title:", game.system.title);
  
  // Check if packs are available at init (they usually aren't)
  const systemPacks = game.system.packs;
  console.log("System packs from config:", systemPacks);
  
  const gamePacks = game.packs;
  console.log("Game packs collection size:", gamePacks.size);
  console.log("Available pack collections:");
  
  if (gamePacks.size === 0) {
    console.log("  - No pack collections available yet at init");
  } else {
    console.log("  - Found pack collections at init");
  }
});

Hooks.once('setup', async function() {
  console.log("=== NSBU SYSTEM LOADED ===");
  console.log("Total packs available:", game.packs.size);
  console.log("System packs registered in system.json:");
  
  // Check system.json packs configuration
  const systemPacks = game.system.packs;
  console.log("Packs from system.json:", systemPacks);
  
  console.log("Compendium Packs Available:");
  
  // Check each compendium pack
  const packNames = ['abilities', 'group-abilities', 'rules-reference'];
  
  packNames.forEach(packName => {
    const fullPackName = `never-stop-blowing-up.${packName}`;
    const pack = game.packs.get(fullPackName);
    
    if (pack) {
      console.log(`✓ ${pack.metadata.label} (${fullPackName})`);
      
      if (packName === 'abilities') {
        pack.getDocuments().then(docs => {
          console.log(`  - Contains ${docs.length} player abilities`);
        });
      } else if (packName === 'group-abilities') {
        pack.getDocuments().then(docs => {
          console.log(`  - Contains ${docs.length} group abilities organized by die size`);
          console.log(`  - Sample entries:`);
          docs.slice(0, 3).forEach(doc => {
            console.log(`    • ${doc.name} (${doc.system?.type || 'unknown type'})`);
          });
        });
      } else if (packName === 'rules-reference') {
        console.log("  - Rules reference compendium found! Attempting to load...");
        pack.getDocuments().then(docs => {
          console.log(`  - Contains ${docs.length} rules reference entries`);
          console.log("  - Rules reference compendium loaded successfully");
          docs.forEach(doc => {
            console.log(`    • ${doc.name} (${doc.system?.type})`);
          });
        }).catch(err => {
          console.error("  - Error loading rules reference:", err);
        });
      }
    } else {
      console.log(`✗ ${packName} pack not found`);
    }
  });
  
  // Register actor sheets
  Actors.registerSheet("never-stop-blowing-up", NSBUActorSheet, {
    types: ["character"],
    makeDefault: true
  });
  
  Actors.registerSheet("never-stop-blowing-up", NSBUNPCSheet, {
    types: ["npc"],
    makeDefault: true
  });

  // Register item sheets
  Items.registerSheet("never-stop-blowing-up", NSBUItemSheet, {
    types: ["explosive", "gear", "upgrade"],
    makeDefault: true
  });
  
  Items.registerSheet("never-stop-blowing-up", NSBUGroupAbilitySheet, {
    types: ["group-ability"],
    makeDefault: true
  });
  
  // Also check if the packs exist in the system definition
  console.log("Checking system-defined packs:");
  
  const systemConfig = game.system;
  console.log(`  - System pack: abilities (${systemConfig?.packs?.get ? 'Available' : 'Not available'})`);
  console.log(`  - System pack: group-abilities (${systemConfig?.packs?.get ? 'Available' : 'Not available'})`);
  console.log(`  - System pack: rules-reference (${systemConfig?.packs?.get ? 'Available' : 'Not available'})`);
  
  if (systemConfig?.packs) {
    systemConfig.packs.forEach((packConfig, packId) => {
      console.log(`  - System pack: ${packId} (${packConfig.label}) - Type: ${packConfig.type}`);
      if (packId === 'rules-reference') {
        console.log(`    → Rules reference pack is defined in system.json`);
      }
    });
  } else {
    console.log("    → System packs definition not available");
  }
  
  console.log("=== SYSTEM READY ===");
});