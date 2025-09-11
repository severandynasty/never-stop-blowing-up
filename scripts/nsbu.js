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
  // Disable button to prevent multiple clicks
  const $button = $(this);
  $button.prop('disabled', true);
  
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
    ui.notifications.warn("Not enough Turbo Tokens available.");
    $button.prop('disabled', false);
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
  let statUpgraded = false;
  if (newLastValue >= lastDie && dieIdx < dieSteps.length - 1) {
    blowUpTriggered = true;
    
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
    
    // Update actor's stat if it blew up
    if (dieIdx > currentDieIdx) {
      await actor.update({[`system.stats.${stat}`]: dieSteps[dieIdx]});
      statUpgraded = true;
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
  
  // Single consolidated notification
  let message = `Added ${tokensToAdd} Turbo Tokens to roll!`;
  if (blowUpTriggered) {
    message += ' Blow-up triggered!';
    if (statUpgraded) {
      message += ` ${stat.toUpperCase()} upgraded to d${dieSteps[dieIdx]}!`;
    }
  }
  ui.notifications.info(message);
});

// Global handler for pass button in chat messages
$(document).on('click', '.pass-btn', async function(event) {
  const $button = $(this);
  $button.prop('disabled', true);
  
  const rollId = $(this).data('roll-id');
  const actorId = $(this).data('actor-id');
  const stat = $(this).data('stat');
  const total = parseInt($(this).data('total'));
  const dieIdx = parseInt($(this).data('die-idx'));
  const naturalMax = $(this).data('natural-max') === 'true';
  
  const actor = game.actors.get(actorId);
  if (!actor) return;
  
  const dieSteps = [4, 6, 8, 10, 12, 20];
  let finalTotal = total;
  let finalDieIdx = dieIdx;
  let rolls = [`d${dieSteps[dieIdx]}: ${total}`];
  
  // If natural maximum, execute blow-up chain
  if (naturalMax) {
    let currentDieIdx = dieIdx;
    let blowUpTotal = total;
    
    do {
      if (currentDieIdx >= dieSteps.length - 1) break;
      currentDieIdx++;
      const currentDie = dieSteps[currentDieIdx];
      const roll = new Roll(`1d${currentDie}`, {}, {async: false});
      await roll.evaluate();
      const value = roll.total;
      rolls.push(`d${currentDie}: ${value}`);
      blowUpTotal += value;
      
      if (value < currentDie) break;
    } while (true);
    
    // Update actor's stat if it blew up
    if (currentDieIdx > dieIdx) {
      await actor.update({[`system.stats.${stat}`]: dieSteps[currentDieIdx]});
      finalDieIdx = currentDieIdx;
    }
    
    finalTotal = blowUpTotal;
  }
  
  // Update the chat message display
  const rollElement = $(this).closest('.nsbu-roll-result');
  rollElement.find('.roll-details').html(rolls.join(' + '));
  rollElement.find('.current-total').text(finalTotal);
  
  // Remove the roll controls
  $(this).closest('.roll-controls').remove();
  
  // Add final result display
  let resultHtml = `<div class="final-result">Final Result: ${finalTotal}</div>`;
  if (naturalMax) {
    resultHtml += `<div class="blow-up-complete">🎯 Blow-up chain complete!${finalDieIdx > dieIdx ? ` ${stat.toUpperCase()} upgraded to d${dieSteps[finalDieIdx]}!` : ''}</div>`;
    
    // If blow-up occurred and actor has tokens, offer to add tokens to the final roll
    const currentTokens = Number(actor.system.turboTokens) || 0;
    if (currentTokens > 0 && finalDieIdx > dieIdx) {
      const lastRollValue = parseInt(rolls[rolls.length - 1].split(': ')[1]);
      const lastDie = dieSteps[finalDieIdx];
      
      resultHtml += `
        <div class="subsequent-tokens-section">
          <div class="turbo-tokens-controls">
            <label>Add tokens to final d${lastDie} roll (${currentTokens} available):</label>
            <input type="number" class="token-input" min="0" max="${currentTokens}" value="0">
            <button type="button" class="add-tokens-btn" 
              data-roll-id="${rollId}"
              data-actor-id="${actorId}"
              data-stat="${stat}"
              data-original-total="${finalTotal}"
              data-last-die="${lastDie}"
              data-last-value="${lastRollValue}"
              data-die-idx="${finalDieIdx}">Add Tokens to Final Roll</button>
          </div>
        </div>
      `;
    }
  }
  
  rollElement.append(resultHtml);
  
  ui.notifications.info(`Roll completed: ${finalTotal}${naturalMax && finalDieIdx > dieIdx ? ` (${stat.toUpperCase()} upgraded!)` : ''}`);
});

// Helper function to create interactive dice roll
async function createInteractiveDiceRoll(actor, stat, statValue) {
  const dieSteps = [4, 6, 8, 10, 12, 20];
  let dieIdx = dieSteps.indexOf(statValue);
  if (dieIdx === -1) dieIdx = 0;
  
  let currentDie = dieSteps[dieIdx];
  let total = 0;
  let lastDie = currentDie;
  let lastValue = 0;
  let rolls = [];
  let finalDieIdx = dieIdx;
  
  // Roll the initial die
  const roll = new Roll(`1d${currentDie}`, {}, {async: false});
  await roll.evaluate();
  lastValue = roll.total;
  total = lastValue;
  rolls.push(`d${currentDie}: ${lastValue}`);
  
  // Check if natural maximum - but don't auto-execute blow-up yet
  let naturalMax = (lastValue === currentDie);
  
  // Create the chat message with appropriate controls
  const rollId = foundry.utils.randomID();
  const currentTokens = Number(actor.system.turboTokens) || 0;
  
  let content;
  if (naturalMax) {
    // Natural maximum - show Pass button and token options
    content = `
      <div class="nsbu-roll-result" data-roll-id="${rollId}">
        <div class="roll-details">${rolls.join(' + ')}</div>
        <div class="roll-total">Total: <span class="current-total">${total}</span></div>
        <div class="natural-max-notice">🎯 Natural ${lastValue}! This will trigger a blow-up chain.</div>
        <div class="roll-controls">
          <button type="button" class="pass-btn" 
            data-roll-id="${rollId}"
            data-actor-id="${actor.id}"
            data-stat="${stat}"
            data-total="${total}"
            data-die-idx="${dieIdx}"
            data-natural-max="true">Pass - Accept Roll & Trigger Blow-up</button>
          ${currentTokens > 0 ? `
          <div class="turbo-tokens-section">
            <div class="turbo-tokens-controls">
              <label>Or add Turbo Tokens first (${currentTokens} available):</label>
              <input type="number" class="token-input" min="0" max="${currentTokens}" value="0">
              <button type="button" class="add-tokens-btn" 
                data-roll-id="${rollId}"
                data-actor-id="${actor.id}"
                data-stat="${stat}"
                data-original-total="${total}"
                data-last-die="${lastDie}"
                data-last-value="${lastValue}"
                data-die-idx="${dieIdx}"
                data-natural-max="true">Add Tokens</button>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  } else {
    // Normal roll - show token controls or pass button
    content = `
      <div class="nsbu-roll-result" data-roll-id="${rollId}">
        <div class="roll-details">${rolls.join(' + ')}</div>
        <div class="roll-total">Total: <span class="current-total">${total}</span></div>
        <div class="roll-controls">
          <button type="button" class="pass-btn" 
            data-roll-id="${rollId}"
            data-actor-id="${actor.id}"
            data-stat="${stat}"
            data-total="${total}"
            data-die-idx="${dieIdx}">Pass - Accept Roll</button>
          ${currentTokens > 0 ? `
          <div class="turbo-tokens-section">
            <div class="turbo-tokens-controls">
              <label>Add Turbo Tokens (${currentTokens} available):</label>
              <input type="number" class="token-input" min="0" max="${currentTokens}" value="0">
              <button type="button" class="add-tokens-btn" 
                data-roll-id="${rollId}"
                data-actor-id="${actor.id}"
                data-stat="${stat}"
                data-original-total="${total}"
                data-last-die="${lastDie}"
                data-last-value="${lastValue}"
                data-die-idx="${dieIdx}">Add Tokens</button>
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  const chatData = {
    user: game.user.id,
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${stat.toUpperCase()} Roll${naturalMax ? ' - Natural Maximum!' : ''}`,
    content: content,
    rolls: [roll],
    rollMode: game.settings.get("core", "rollMode"),
    sound: null // Explicitly disable sound
  };
  
  await ChatMessage.create(chatData);
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
