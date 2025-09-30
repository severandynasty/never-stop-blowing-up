// Debug logging helper function
function debugLog(...args) {
  // Check if debug logging is enabled in game settings
  // Use try-catch to handle cases where game/settings aren't ready yet
  try {
    if (game?.settings?.get("never-stop-blowing-up", "enableDebugLogging")) {
      console.log(...args);
    }
  } catch (error) {
    // If settings aren't available yet, fall back to silent (don't log)
    // This prevents errors during system initialization
  }
}

// Track active roll sequences to prevent race conditions
const activeRollSequences = new Map();
const rollSequenceTimeouts = new Map(); // Track timeouts for auto-cleanup

// Function to clear a roll sequence and its timeout
function clearRollSequence(actorId, stat, reason = '') {
  const sequenceKey = `${actorId}-${stat}`;
  const sequenceId = activeRollSequences.get(sequenceKey);
  
  if (sequenceId) {
    activeRollSequences.delete(sequenceKey);
    debugLog(`🔓 DEBUG: Cleared roll sequence ${sequenceId} for ${stat} ${reason}`);
  }
  
  // Clear any associated timeout
  const timeoutId = rollSequenceTimeouts.get(sequenceKey);
  if (timeoutId) {
    clearTimeout(timeoutId);
    rollSequenceTimeouts.delete(sequenceKey);
    debugLog(`⏰ DEBUG: Cleared timeout for ${stat} sequence`);
  }
}

// Setup global event handlers when Foundry is ready
Hooks.once('ready', function() {
  debugLog("=== Setting up NSBU global event handlers ===");
  
  // Global handler for accept roll button - using namespace to prevent duplicates
  $(document).off('click.nsbu-accept', '.accept-roll-btn');
  $(document).on('click.nsbu-accept', '.accept-roll-btn', async function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const $button = $(this);
    const actorId = $(this).data('actor-id');
    
    // Check if current user can control this actor
    const actor = game.actors.get(actorId);
    if (!actor || !actor.isOwner) {
      ui.notifications.warn("You don't have permission to control this character's rolls.");
      return;
    }
    
    // Check if already processing
    if ($button.prop('disabled') || $button.hasClass('processing')) {
      console.log('🚫 Accept roll button already processing, ignoring click');
      return;
    }
    
    // Mark as processing immediately
    $button.addClass('processing').prop('disabled', true);
    
    const finalTotal = parseInt($(this).data('final-total'));
    const stat = $(this).data('stat');
    const rollSequenceId = $(this).data('sequence-id');
    
    // Clear the active roll sequence
    if (rollSequenceId && actorId && stat) {
      clearRollSequence(actorId, stat, '(accepted)');
    }

    // Find the chat message and update it for all players
    const messageElement = $(this).closest('.message');
    const messageId = messageElement.data('message-id');
    const chatMessage = game.messages.get(messageId);
    
    if (chatMessage) {
      // Get the current content and modify it
      const $tempDiv = $('<div>').html(chatMessage.content);
      const $rollResult = $tempDiv.find('.nsbu-roll-result');
      
      // Update the roll details to show accepted
      $rollResult.find('.roll-details').append(' → ACCEPTED');
      
      // Remove the roll controls
      $rollResult.find('.roll-controls').remove();
      
      // Remove the observer message
      $rollResult.find('.roll-observer').remove();
      
      // Add final result display
      $rollResult.append(`<div class="final-result">Final Result: ${finalTotal}</div>`);
      
      // Update the chat message content for all players
      await chatMessage.update({
        content: $tempDiv.html()
      });
      
      debugLog(`✅ DEBUG: Updated chat message ${messageId} with accepted roll result`);
    } else {
      console.error('❌ DEBUG: Could not find chat message to update');
      // Fallback to local update
      const rollElement = $(this).closest('.nsbu-roll-result');
      rollElement.find('.roll-details').append(' → ACCEPTED');
      $(this).closest('.roll-controls').remove();
      rollElement.append(`<div class="final-result">Final Result: ${finalTotal}</div>`);
    }
  });

  // Global handler for adding tokens to current die - using namespace to prevent duplicates
  $(document).off('click.nsbu-tokens', '.add-tokens-to-die-btn');
  $(document).on('click.nsbu-tokens', '.add-tokens-to-die-btn', async function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const $button = $(this);
    const actorId = $(this).data('actor-id');
    
    // Check if current user can control this actor
    const actor = game.actors.get(actorId);
    if (!actor || !actor.isOwner) {
      ui.notifications.warn("You don't have permission to control this character's rolls.");
      return;
    }
    
    // Check if already processing
    if ($button.prop('disabled') || $button.hasClass('processing')) {
      console.log('🚫 Add tokens button already processing, ignoring click');
      return;
    }
    
    // Mark as processing immediately
    $button.addClass('processing').prop('disabled', true);
    
    console.log('💰 Add tokens button clicked - processing...');
    
    const rollId = $(this).data('roll-id');
    const stat = $(this).data('stat');
    const dieValue = parseInt($(this).data('die-value'));
    const currentDie = parseInt($(this).data('current-die'));
    const currentDieIdx = parseInt($(this).data('current-die-idx'));
    const cumulativeTotal = parseInt($(this).data('cumulative-total')) || 0;
    const rollSequenceId = $(this).data('sequence-id');
    
    debugLog(`💰 DEBUG: Token handler - sequenceId: ${rollSequenceId}, cumulative: ${cumulativeTotal}`);
    
    const tokensToAdd = Math.max(0, parseInt($(this).siblings('.token-input').val()) || 0);
    
    if (tokensToAdd <= 0) {
      $button.removeClass('processing').prop('disabled', false);
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
    
    debugLog(`💰 DEBUG: Token blow-up - ${dieValue} + ${tokensToAdd} tokens = ${newDieResult} on d${currentDie}`);
    debugLog(`📊 DEBUG: Updated cumulative total: ${cumulativeTotal} -> ${newCumulativeTotal}`);
    
    // Spend the turbo tokens and track episode spending
    const currentEpisodeTokens = Number(actor.system.tokensSpentThisEpisode) || 0;
    debugLog(`📊 DEBUG: Token spending - Actor: ${actor.name} (${actor.id}), Current episode tokens: ${currentEpisodeTokens}, Adding: ${tokensToAdd}, New total: ${currentEpisodeTokens + tokensToAdd}`);
    await actor.update({ 
      'system.turboTokens': currentTokens - tokensToAdd,
      'system.tokensSpentThisEpisode': currentEpisodeTokens + tokensToAdd
    });
    
    // Update the chat message display
    const rollElement = $(this).closest('.nsbu-roll-result');
    rollElement.find('.roll-details').html(`Rolling ${stat.toUpperCase()} (d${currentDie}): ${dieValue} + ${tokensToAdd} tokens = ${newDieResult}`);
    rollElement.find('.current-total').text(newDieResult);
    
    // Remove current controls immediately to prevent multiple clicks - but only if they still exist
    const controlsElement = $(this).closest('.roll-controls');
    if (controlsElement.length > 0) {
      controlsElement.remove();
      debugLog('🗑️ DEBUG: Roll controls removed');
    } else {
      debugLog('⚠️ DEBUG: Roll controls already removed!');
    }
    
    // Check if we hit the die maximum (blow-up)
    if (newDieResult >= currentDie) {
      debugLog(`💥 DEBUG: Token blow-up triggered! ${newDieResult} >= ${currentDie}`);
      
      // BLOW UP! Advance to next die
      if (currentDieIdx < dieSteps.length - 1) {
        const newDieIdx = currentDieIdx + 1;
        const newDie = dieSteps[newDieIdx];
        
        debugLog(`💥 DEBUG: Upgrading stat from d${currentDie} to d${newDie} due to token blow-up`);
        
        // Update actor's stat
        await actor.update({[`system.stats.${stat}`]: newDie});
        
        // Add blow-up notice
        rollElement.append(`<div class="blow-up-notice">💥 BLOW UP!<br/>${stat.toUpperCase()} upgraded to d${newDie}!</div>`);
        
        debugLog(`💥 DEBUG: Calling createInteractiveDiceRoll for upgraded d${newDie}, sequenceId: ${rollSequenceId}`);
        
        // Create a completely new roll for the next die instead of continuing in same message
        await createInteractiveDiceRoll(actor, stat, newDie, newCumulativeTotal, rollSequenceId);
      } else {
        // Already at maximum die (d20) - update chat message for all players
        const messageElement = $(this).closest('.message');
        const messageId = messageElement.data('message-id');
        const chatMessage = game.messages.get(messageId);
        
        if (chatMessage) {
          // Get the current content and modify it
          const $tempDiv = $('<div>').html(chatMessage.content);
          const $rollResult = $tempDiv.find('.nsbu-roll-result');
          
          // Update the roll details to show token addition
          $rollResult.find('.roll-details').html(`Rolling ${stat.toUpperCase()} (d${currentDie}): ${dieValue} + ${tokensToAdd} tokens = ${newDieResult}`);
          
          // Remove the roll controls and observer message
          $rollResult.find('.roll-controls').remove();
          $rollResult.find('.roll-observer').remove();
          
          // Add blow-up notice and final result
          $rollResult.append(`<div class="blow-up-notice">💥 BLOW UP!<br/>${stat.toUpperCase()} upgraded to d${currentDie}!</div>`);
          $rollResult.append(`<div class="final-result">Final Result: ${newCumulativeTotal} (Maximum die reached!)</div>`);
          
          // Update the chat message content for all players
          await chatMessage.update({
            content: $tempDiv.html()
          });
          
          debugLog(`✅ DEBUG: Updated chat message ${messageId} with max die token result`);
        } else {
          console.error('❌ DEBUG: Could not find chat message to update');
          // Fallback to local update
          rollElement.append(`<div class="final-result">Final Result: ${newCumulativeTotal} (Maximum die reached!)</div>`);
        }
        
        // Clear the roll sequence as it's complete
        clearRollSequence(actor.id, stat, '(max die reached)');
      }
    } else {
      // No blow-up, just final result - update chat message for all players
      const messageElement = $(this).closest('.message');
      const messageId = messageElement.data('message-id');
      const chatMessage = game.messages.get(messageId);
      
      if (chatMessage) {
        // Get the current content and modify it
        const $tempDiv = $('<div>').html(chatMessage.content);
        const $rollResult = $tempDiv.find('.nsbu-roll-result');
        
        // Update the roll details to show token addition
        $rollResult.find('.roll-details').html(`Rolling ${stat.toUpperCase()} (d${currentDie}): ${dieValue} + ${tokensToAdd} tokens = ${newDieResult}`);
        
        // Remove the roll controls and observer message
        $rollResult.find('.roll-controls').remove();
        $rollResult.find('.roll-observer').remove();
        
        // Add final result display
        $rollResult.append(`<div class="final-result">Final Result: ${newCumulativeTotal}</div>`);
        
        // Update the chat message content for all players
        await chatMessage.update({
          content: $tempDiv.html()
        });
        
        debugLog(`✅ DEBUG: Updated chat message ${messageId} with token result (no blow-up)`);
      } else {
        console.error('❌ DEBUG: Could not find chat message to update');
        // Fallback to local update
        rollElement.append(`<div class="final-result">Final Result: ${newCumulativeTotal}</div>`);
      }
      
      // Clear the roll sequence as it's complete
      clearRollSequence(actor.id, stat, '(no blow-up)');
    }
  });

  // Global handler for refresh tokens button - using namespace to prevent duplicates
  $(document).off('click.nsbu-refresh', '.refresh-tokens-btn');
  $(document).on('click.nsbu-refresh', '.refresh-tokens-btn', async function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const $button = $(this);
    const actorId = $(this).data('actor-id');
    
    // Check if current user can control this actor
    const actor = game.actors.get(actorId);
    if (!actor || !actor.isOwner) {
      ui.notifications.warn("You don't have permission to control this character's rolls.");
      return;
    }
    
    debugLog('🔄 DEBUG: Refresh tokens button clicked');
    
    // Get current token count from actor
    const currentTokens = Number(actor.system.turboTokens) || 0;
    
    // Find the roll result container
    const $rollResult = $button.closest('.nsbu-roll-result');
    const $availableTokensSpan = $rollResult.find('.available-tokens');
    const $tokenInput = $rollResult.find('.token-input');
    const $addTokensBtn = $rollResult.find('.add-tokens-to-die-btn');
    
    // Update the displayed token count
    $availableTokensSpan.text(currentTokens);
    
    // Update the input max value and reset to 0
    $tokenInput.attr('max', currentTokens).val(0);
    
    // Enable/disable the add tokens button based on availability
    if (currentTokens > 0) {
      $addTokensBtn.prop('disabled', false).removeClass('disabled');
    } else {
      $addTokensBtn.prop('disabled', true).addClass('disabled');
    }
    
    // Enable/disable the auto blow-up button based on token availability
    const $autoBlowUpBtn = $rollResult.find('.auto-blowup-btn');
    if ($autoBlowUpBtn.length > 0) {
      const dieValue = parseInt($autoBlowUpBtn.data('die-value'));
      const currentDie = parseInt($autoBlowUpBtn.data('current-die'));
      const tokensNeeded = currentDie - dieValue;
      
      if (tokensNeeded > 0 && tokensNeeded <= currentTokens) {
        $autoBlowUpBtn.prop('disabled', false).removeClass('disabled')
          .css({
            'background': '#f8f8f8',
            'color': '#000',
            'cursor': 'pointer'
          });
      } else {
        $autoBlowUpBtn.prop('disabled', true).addClass('disabled')
          .css({
            'background': '#e0e0e0',
            'color': '#999',
            'cursor': 'not-allowed'
          });
      }
    }
    
    // Visual feedback
    $button.html('✅').prop('disabled', true);
    setTimeout(() => {
      $button.html('🔄').prop('disabled', false);
    }, 1000);
    
    ui.notifications.info(`Token count refreshed: ${currentTokens} available`);
    debugLog(`🔄 DEBUG: Refreshed token count to ${currentTokens} for ${actor.name}`);
  });

  // Global handler for token increase button (+)
  $(document).off('click.nsbu-token-inc', '.token-increase-btn');
  $(document).on('click.nsbu-token-inc', '.token-increase-btn', function(event) {
    event.preventDefault();
    const $input = $(this).siblings('.token-input');
    const $rollControls = $(this).closest('.roll-controls');
    const $combinedBtn = $rollControls.find('.combined-roll-btn');
    
    const current = parseInt($input.val()) || 0;
    const maxAvailable = parseInt($input.attr('max')) || 0;
    
    // Calculate the maximum tokens needed to blow up the die
    const dieValue = parseInt($combinedBtn.data('die-value'));
    const currentDie = parseInt($combinedBtn.data('current-die'));
    const tokensNeededForBlowUp = currentDie - dieValue;
    
    // Get injury-adjusted limits
    const actorId = $rollControls.data('actor-id');
    const actor = game.actors.get(actorId);
    const tokenInfo = getInjuryAdjustedTokenInfo(actor, current + 1);
    
    // The effective maximum is the smaller of: available tokens (considering injury), tokens needed for blow-up, or max available
    const effectiveMax = Math.min(maxAvailable, tokensNeededForBlowUp, tokenInfo.maxAffordableTokens);
    
    debugLog(`🔺 DEBUG: Token increase - dieValue: ${dieValue}, currentDie: d${currentDie}, tokensNeeded: ${tokensNeededForBlowUp}, available: ${maxAvailable}, injuryRatio: ${tokenInfo.tokenRatio}, maxAffordable: ${tokenInfo.maxAffordableTokens}, effectiveMax: ${effectiveMax}`);
    
    if (current < effectiveMax) {
      $input.val(current + 1);
      updateInjuryWarning($rollControls, tokenInfo.injuryLevel, tokenInfo.tokenRatio);
      updateCombinedButtonText($rollControls);
    } else if (current >= tokensNeededForBlowUp && tokensNeededForBlowUp > 0) {
      // Give feedback when they hit the blow-up limit
      ui.notifications.info(`Maximum ${tokensNeededForBlowUp} tokens needed to blow up d${currentDie} (save the rest for next roll!)`);
    } else if (current >= tokenInfo.maxAffordableTokens) {
      // Give feedback about injury token limits
      const costMsg = tokenInfo.tokenRatio > 1 ? ` (${tokenInfo.tokenRatio}:1 due to injury)` : '';
      ui.notifications.warn(`Not enough tokens! You need ${tokenInfo.tokenRatio} token(s) but only have ${tokenInfo.availableTokens}${costMsg}`);
    }
  });

  // Global handler for token decrease button (-)
  $(document).off('click.nsbu-token-dec', '.token-decrease-btn');
  $(document).on('click.nsbu-token-dec', '.token-decrease-btn', function(event) {
    event.preventDefault();
    const $input = $(this).siblings('.token-input');
    const current = parseInt($input.val()) || 0;
    if (current > 0) {
      $input.val(current - 1);
      updateCombinedButtonText($(this).closest('.roll-controls'));
    }
  });

  // Global handler for token input changes
  $(document).off('input.nsbu-token', '.token-input');
  $(document).on('input.nsbu-token', '.token-input', function(event) {
    const $input = $(this);
    let value = parseInt($input.val());
    const min = parseInt($input.attr('min')) || 0;
    const max = parseInt($input.attr('max')) || 999;
    const $rollControls = $input.closest('.roll-controls');
    
    // Get injury-adjusted limits
    const actorId = $rollControls.data('actor-id');
    const actor = game.actors.get(actorId);
    const tokenInfo = getInjuryAdjustedTokenInfo(actor, value);
    
    // The effective maximum considering injury ratio
    const effectiveMax = Math.min(max, tokenInfo.maxAffordableTokens);
    
    // Validate and clamp the value
    if (isNaN(value) || value < min) {
      $input.val(min);
      value = min;
    } else if (value > effectiveMax) {
      $input.val(effectiveMax);
      value = effectiveMax;
    }
    
    // Update injury warning and button text
    const finalTokenInfo = getInjuryAdjustedTokenInfo(actor, value);
    updateInjuryWarning($rollControls, finalTokenInfo.injuryLevel, finalTokenInfo.tokenRatio);
    updateCombinedButtonText($rollControls);
  });

  // Prevent negative number input in token fields
  $(document).off('keydown.nsbu-token-prevent', '.token-input');
  $(document).on('keydown.nsbu-token-prevent', '.token-input', function(event) {
    // Allow: backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
        // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (event.keyCode === 65 && event.ctrlKey === true) ||
        (event.keyCode === 67 && event.ctrlKey === true) ||
        (event.keyCode === 86 && event.ctrlKey === true) ||
        (event.keyCode === 88 && event.ctrlKey === true) ||
        // Allow: home, end, left, right
        (event.keyCode >= 35 && event.keyCode <= 39)) {
      return;
    }
    // Prevent: minus sign, plus sign, decimal point
    if (event.keyCode === 189 || event.keyCode === 187 || event.keyCode === 190 || event.keyCode === 110) {
      event.preventDefault();
    }
  });

  // Prevent pasting negative values in token fields
  $(document).off('paste.nsbu-token-prevent', '.token-input');
  $(document).on('paste.nsbu-token-prevent', '.token-input', function(event) {
    setTimeout(() => {
      const $input = $(this);
      let value = parseInt($input.val());
      const min = parseInt($input.attr('min')) || 0;
      const max = parseInt($input.attr('max')) || 999;
      
      if (isNaN(value) || value < min) {
        $input.val(min);
      } else if (value > max) {
        $input.val(max);
      }
      
      updateCombinedButtonText($input.closest('.roll-controls'));
    }, 1);
  });

  // Global handler for combined roll button
  $(document).off('click.nsbu-combined', '.combined-roll-btn');
  $(document).on('click.nsbu-combined', '.combined-roll-btn', async function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const $button = $(this);
    const actorId = $(this).data('actor-id');
    
    // Check if current user can control this actor
    const actor = game.actors.get(actorId);
    if (!actor || !actor.isOwner) {
      ui.notifications.warn("You don't have permission to control this character's rolls.");
      return;
    }
    
    // Check if already processing
    if ($button.prop('disabled') || $button.hasClass('processing')) {
      console.log('🚫 Combined roll button already processing, ignoring click');
      return;
    }
    
    // Mark as processing immediately
    $button.addClass('processing').prop('disabled', true);
    
    const tokensToAdd = Math.max(0, parseInt($(this).closest('.roll-controls').find('.token-input').val()) || 0);
    
    if (tokensToAdd === 0) {
      // Just accept the roll
      const finalTotal = parseInt($(this).data('final-total'));
      const stat = $(this).data('stat');
      const rollSequenceId = $(this).data('sequence-id');
      
      // Clear the active roll sequence
      if (rollSequenceId && actorId && stat) {
        clearRollSequence(actorId, stat, '(accepted)');
      }

      // Find and update the chat message
      const messageElement = $(this).closest('.message');
      const messageId = messageElement.data('message-id');
      const chatMessage = game.messages.get(messageId);
      
      if (chatMessage) {
        const $tempDiv = $('<div>').html(chatMessage.content);
        const $rollResult = $tempDiv.find('.nsbu-roll-result');
        
        $rollResult.find('.roll-details').append(' → ACCEPTED');
        $rollResult.find('.roll-controls').remove();
        $rollResult.find('.roll-observer').remove();
        $rollResult.append(`<div class="final-result">Final Result: ${finalTotal}</div>`);
        
        await chatMessage.update({
          content: $tempDiv.html()
        });
        
        debugLog(`✅ DEBUG: Updated chat message ${messageId} with accepted roll result`);
      }
    } else {
      // Add tokens and process
      // This will reuse the existing add-tokens logic
      const rollId = $(this).data('roll-id');
      const stat = $(this).data('stat');
      const dieValue = parseInt($(this).data('die-value'));
      const currentDie = parseInt($(this).data('current-die'));
      const currentDieIdx = parseInt($(this).data('current-die-idx'));
      const cumulativeTotal = parseInt($(this).data('cumulative-total')) || 0;
      const rollSequenceId = $(this).data('sequence-id');
      
      debugLog(`💰 DEBUG: Combined button - adding ${tokensToAdd} tokens`);
      
      const tokenInfo = getInjuryAdjustedTokenInfo(actor, tokensToAdd);
      if (!tokenInfo.canAfford) {
        $button.prop('disabled', false).removeClass('processing');
        const costMsg = tokenInfo.tokenRatio > 1 ? ` (${tokensToAdd} tokens × ${tokenInfo.tokenRatio} = ${tokenInfo.actualCost} due to injury)` : '';
        ui.notifications.warn(`You don't have enough turbo tokens! Need ${tokenInfo.actualCost}, have ${tokenInfo.availableTokens}${costMsg}`);
        return;
      }
      
      // Calculate new die result
      const newDieResult = dieValue + tokensToAdd;
      const dieSteps = [4, 6, 8, 10, 12, 20];
      
      // Calculate new cumulative total including these tokens
      const tokensOnlyTotal = cumulativeTotal - dieValue;
      const newCumulativeTotal = tokensOnlyTotal + newDieResult;
      
      debugLog(`💰 DEBUG: Combined button - ${dieValue} + ${tokensToAdd} tokens = ${newDieResult} on d${currentDie}`);
      debugLog(`📊 DEBUG: Updated cumulative total: ${cumulativeTotal} -> ${newCumulativeTotal}`);
      
      // Spend the turbo tokens and track episode spending (using actual cost including injury)
      const currentEpisodeTokens = Number(actor.system.tokensSpentThisEpisode) || 0;
      debugLog(`📊 DEBUG: Combined button token spending - Actor: ${actor.name} (${actor.id}), Current episode tokens: ${currentEpisodeTokens}, Adding: ${tokensToAdd} (cost: ${tokenInfo.actualCost}), New total: ${currentEpisodeTokens + tokenInfo.actualCost}`);
      await actor.update({ 
        'system.turboTokens': tokenInfo.availableTokens - tokenInfo.actualCost,
        'system.tokensSpentThisEpisode': currentEpisodeTokens + tokenInfo.actualCost
      });
      
      // Check if we hit the die maximum (blow-up)
      if (newDieResult >= currentDie) {
        debugLog(`💥 DEBUG: Combined button blow-up triggered! ${newDieResult} >= ${currentDie}`);
        
        // BLOW UP! Advance to next die
        if (currentDieIdx < dieSteps.length - 1) {
          const newDieIdx = currentDieIdx + 1;
          const newDie = dieSteps[newDieIdx];
          
          debugLog(`💥 DEBUG: Upgrading stat from d${currentDie} to d${newDie} due to combined button blow-up`);
          
          // Update actor's stat
          await actor.update({[`system.stats.${stat}`]: newDie});
          
          // Update the chat message with blow-up notice
          const messageElement = $(this).closest('.message');
          const messageId = messageElement.data('message-id');
          const chatMessage = game.messages.get(messageId);
          
          if (chatMessage) {
            const $tempDiv = $('<div>').html(chatMessage.content);
            const $rollResult = $tempDiv.find('.nsbu-roll-result');
            
            $rollResult.find('.roll-details').html(`Rolling ${stat.toUpperCase()} (d${currentDie}): ${dieValue} + ${tokensToAdd} tokens = ${newDieResult}`);
            $rollResult.find('.roll-controls').remove();
            $rollResult.find('.roll-observer').remove();
            $rollResult.append(`<div class="blow-up-notice">💥 BLOW UP!<br/>${stat.toUpperCase()} upgraded to d${newDie}!</div>`);
            
            await chatMessage.update({
              content: $tempDiv.html()
            });
          }
          
          debugLog(`💥 DEBUG: Calling createInteractiveDiceRoll for upgraded d${newDie}, sequenceId: ${rollSequenceId}`);
          
          // Create a completely new roll for the next die
          await createInteractiveDiceRoll(actor, stat, newDie, newCumulativeTotal, rollSequenceId);
        } else {
          // At maximum die (d20) - check setting for continued blow-ups
          const d20BlowUpSetting = game.settings.get("never-stop-blowing-up", "d20BlowUpDie");
          debugLog(`💥 DEBUG: Maximum die reached (d20), d20BlowUpDie setting: ${d20BlowUpSetting}`);
          
          if (d20BlowUpSetting === "d100") {
            // Continue with d100 blow-up logic
            debugLog(`💥 DEBUG: Continuing with d100 blow-up for ${stat}`);
            
            // Update the current message to show the d20 result and blow-up
            const messageElement = $(this).closest('.message');
            const messageId = messageElement.data('message-id');
            const chatMessage = game.messages.get(messageId);
            
            if (chatMessage) {
              const $tempDiv = $('<div>').html(chatMessage.content);
              const $rollResult = $tempDiv.find('.nsbu-roll-result');
              
              $rollResult.find('.roll-details').html(`Rolling ${stat.toUpperCase()} (d${currentDie}): ${dieValue} + ${tokensToAdd} tokens = ${newDieResult}`);
              $rollResult.find('.roll-controls').remove();
              $rollResult.find('.roll-observer').remove();
              $rollResult.append(`<div class="blow-up-notice">💥 BLOW UP!<br/>${stat.toUpperCase()} continues with d100!</div>`);
              
              await chatMessage.update({
                content: $tempDiv.html()
              });
            }
            
            // Create a new d100 roll (stat remains at d20)
            const currentTokens = Number(actor.system.turboTokens) || 0;
            const rollId = foundry.utils.randomID();
            
            // Create a d100 roll
            const d100Roll = new Roll("1d100");
            await d100Roll.evaluate();
            const d100Value = d100Roll.total;
            
            debugLog(`💥 DEBUG: D100 continuation roll result: ${d100Value}`);
            
            const d100Content = `
              <div class="nsbu-roll-result" data-roll-id="${rollId}" data-actor-id="${actor.id}">
                <div class="roll-details">Rolling ${stat.toUpperCase()} (d100 continued): ${d100Value}</div>
                <div class="roll-total">
                  <span class="current-die-label">Current Die:</span> <span class="current-die-total">${d100Value}</span>
                  <br/>Cumulative Total: <span class="cumulative-total">${newCumulativeTotal + d100Value}</span>
                </div>
                <div class="roll-controls" data-actor-id="${actor.id}" style="display: none;">
                  <div class="turbo-tokens-section">
                    <div class="turbo-tokens-controls">
                      <label>Turbo Tokens (<span class="available-tokens">${currentTokens}</span> Available):</label>
                      <div style="display: flex; align-items: center; gap: 5px; margin: 5px 0;">
                        <button type="button" class="token-decrease-btn" 
                          style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">−</button>
                        <input type="number" class="token-input" min="0" max="${currentTokens}" value="0" 
                          style="flex: 1; padding: 6px; text-align: center; box-sizing: border-box; border: 1px solid #999; border-radius: 3px;">
                        <button type="button" class="token-increase-btn" 
                          style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">+</button>
                        <button type="button" class="refresh-tokens-btn" 
                          data-roll-id="${rollId}"
                          data-actor-id="${actor.id}"
                          title="Refresh available token count"
                          style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">🔄</button>
                        <button type="button" class="auto-blowup-btn" 
                          data-roll-id="${rollId}"
                          data-actor-id="${actor.id}"
                          data-stat="${stat}"
                          data-die-value="${d100Value}"
                          data-current-die="100"
                          title="Automatically blow up this die"
                          ${(100 - d100Value) > currentTokens || (100 - d100Value) <= 0 ? 'disabled' : ''}
                          style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: ${(100 - d100Value) > currentTokens || (100 - d100Value) <= 0 ? '#e0e0e0' : '#f8f8f8'}; color: ${(100 - d100Value) > currentTokens || (100 - d100Value) <= 0 ? '#999' : '#000'}; cursor: ${(100 - d100Value) > currentTokens || (100 - d100Value) <= 0 ? 'not-allowed' : 'pointer'}; display: flex; align-items: center; justify-content: center; font-size: 14px;">💥</button>
                      </div>
                      <button type="button" class="combined-roll-btn" 
                        data-roll-id="${rollId}"
                        data-actor-id="${actor.id}"
                        data-stat="${stat}"
                        data-die-value="${d100Value}"
                        data-current-die="100"
                        data-current-die-idx="6"
                        data-cumulative-total="${newCumulativeTotal + d100Value}"
                        data-final-total="${newCumulativeTotal + d100Value}"
                        data-sequence-id="${rollSequenceId}"
                        style="width: 100%; padding: 8px; margin-top: 5px; background: #4CAF50; color: white; border: 1px solid #45a049; border-radius: 3px; cursor: pointer; font-weight: bold;">
                        <span class="btn-text">Accept Roll (Total: ${newCumulativeTotal + d100Value})</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="roll-observer" data-actor-id="${actor.id}">
                  <em>Waiting for ${actor.name || 'the player'} to accept or modify this roll...</em>
                </div>
              </div>
            `;

            const d100ChatData = {
              user: game.user.id,
              speaker: ChatMessage.getSpeaker({ actor }),
              flavor: `${stat.toUpperCase()} D100 Continued Roll`,
              content: d100Content,
              rolls: [d100Roll],
              rollMode: game.settings.get("core", "rollMode"),
              sound: CONFIG.sounds.dice
            };

            await ChatMessage.create(d100ChatData);
          } else {
            // Continue with d20 rolls (setting: "d20")
            debugLog(`🎯 DEBUG: Continuing with d20 rolls (setting: ${d20BlowUpSetting})`);
            
            // Update current message to show blow-up
            const messageElement = $(this).closest('.message');
            const messageId = messageElement.data('message-id');
            const chatMessage = game.messages.get(messageId);
            
            if (chatMessage) {
              const $tempDiv = $('<div>').html(chatMessage.content);
              const $rollResult = $tempDiv.find('.nsbu-roll-result');
              
              $rollResult.find('.roll-details').html(`Rolling ${stat.toUpperCase()} (d${currentDie}): ${dieValue} + ${tokensToAdd} tokens = ${newDieResult}`);
              $rollResult.find('.roll-controls').remove();
              $rollResult.find('.roll-observer').remove();
              $rollResult.append(`<div class="blow-up-notice">💥 BLOW UP!<br/>${stat.toUpperCase()} stays at d20, continuing rolls!</div>`);
              
              await chatMessage.update({
                content: $tempDiv.html()
              });
            }
            
            // Create another d20 roll for continued blow-up (stat stays at d20)
            const currentTokens = Number(actor.system.turboTokens) || 0;
            const rollId = foundry.utils.randomID();
            
            // Create a d20 roll
            const d20Roll = new Roll("1d20");
            await d20Roll.evaluate();
            const d20Value = d20Roll.total;
            
            debugLog(`🎯 DEBUG: D20 continuation roll result: ${d20Value}`);
            
            const d20Content = `
              <div class="nsbu-roll-result" data-roll-id="${rollId}" data-actor-id="${actor.id}">
                <div class="roll-details">Rolling ${stat.toUpperCase()} (d20 continued): ${d20Value}</div>
                <div class="roll-total">
                  <span class="current-die-label">Current Die:</span> <span class="current-die-total">${d20Value}</span>
                  <br/>Cumulative Total: <span class="cumulative-total">${newCumulativeTotal + d20Value}</span>
                </div>
                <div class="roll-controls" data-actor-id="${actor.id}" style="display: none;">
                  <div class="turbo-tokens-section">
                    <div class="turbo-tokens-controls">
                      <label>Turbo Tokens (<span class="available-tokens">${currentTokens}</span> Available):</label>
                      <div style="display: flex; align-items: center; gap: 5px; margin: 5px 0;">
                        <button type="button" class="token-decrease-btn" 
                          style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">−</button>
                        <input type="number" class="token-input" min="0" max="${currentTokens}" value="0" 
                          style="flex: 1; padding: 6px; text-align: center; box-sizing: border-box; border: 1px solid #999; border-radius: 3px;">
                        <button type="button" class="token-increase-btn" 
                          style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">+</button>
                        <button type="button" class="refresh-tokens-btn" 
                          data-roll-id="${rollId}"
                          data-actor-id="${actor.id}"
                          title="Refresh available token count"
                          style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">🔄</button>
                        <button type="button" class="auto-blowup-btn" 
                          data-roll-id="${rollId}"
                          data-actor-id="${actor.id}"
                          data-stat="${stat}"
                          data-die-value="${d20Value}"
                          data-current-die="20"
                          title="Automatically blow up this die"
                          ${(20 - d20Value) > currentTokens || (20 - d20Value) <= 0 ? 'disabled' : ''}
                          style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: ${(20 - d20Value) > currentTokens || (20 - d20Value) <= 0 ? '#e0e0e0' : '#f8f8f8'}; color: ${(20 - d20Value) > currentTokens || (20 - d20Value) <= 0 ? '#999' : '#000'}; cursor: ${(20 - d20Value) > currentTokens || (20 - d20Value) <= 0 ? 'not-allowed' : 'pointer'}; display: flex; align-items: center; justify-content: center; font-size: 14px;">💥</button>
                      </div>
                      <button type="button" class="combined-roll-btn" 
                        data-roll-id="${rollId}"
                        data-actor-id="${actor.id}"
                        data-stat="${stat}"
                        data-die-value="${d20Value}"
                        data-current-die="20"
                        data-current-die-idx="5"
                        data-cumulative-total="${newCumulativeTotal + d20Value}"
                        data-final-total="${newCumulativeTotal + d20Value}"
                        data-sequence-id="${rollSequenceId}"
                        style="width: 100%; padding: 8px; margin-top: 5px; background: #4CAF50; color: white; border: 1px solid #45a049; border-radius: 3px; cursor: pointer; font-weight: bold;">
                        <span class="btn-text">Accept Roll (Total: ${newCumulativeTotal + d20Value})</span>
                      </button>
                    </div>
                  </div>
                </div>
                <div class="roll-observer" data-actor-id="${actor.id}">
                  <em>Waiting for ${actor.name || 'the player'} to accept or modify this roll...</em>
                </div>
              </div>
            `;

            const d20ChatData = {
              user: game.user.id,
              speaker: ChatMessage.getSpeaker({ actor }),
              flavor: `${stat.toUpperCase()} D20 Continued Roll`,
              content: d20Content,
              rolls: [d20Roll],
              rollMode: game.settings.get("core", "rollMode"),
              sound: CONFIG.sounds.dice
            };

            await ChatMessage.create(d20ChatData);
          }
        }
      } else {
        // No blow-up, just final result
        const messageElement = $(this).closest('.message');
        const messageId = messageElement.data('message-id');
        const chatMessage = game.messages.get(messageId);
        
        if (chatMessage) {
          const $tempDiv = $('<div>').html(chatMessage.content);
          const $rollResult = $tempDiv.find('.nsbu-roll-result');
          
          $rollResult.find('.roll-details').html(`Rolling ${stat.toUpperCase()} (d${currentDie}): ${dieValue} + ${tokensToAdd} tokens = ${newDieResult}`);
          $rollResult.find('.roll-controls').remove();
          $rollResult.find('.roll-observer').remove();
          $rollResult.append(`<div class="final-result">Final Result: ${newCumulativeTotal}</div>`);
          
          await chatMessage.update({
            content: $tempDiv.html()
          });
        }
        
        clearRollSequence(actor.id, stat, '(no blow-up)');
      }
    }
  });
  
  console.log("=== NSBU global event handlers setup complete ===");
  
  // Show initial debug logging status
  const debugEnabled = game?.settings?.get("never-stop-blowing-up", "enableDebugLogging") || false;
  console.log(`🔧 NSBU Debug Logging is currently ${debugEnabled ? 'ENABLED' : 'DISABLED'} (can be changed in Game Settings)`);
});

// Global handler for auto blow-up button
$(document).off('click.nsbu-auto-blowup', '.auto-blowup-btn');
$(document).on('click.nsbu-auto-blowup', '.auto-blowup-btn', async function(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const $button = $(this);
  const actorId = $(this).data('actor-id');
  
  // Check if current user can control this actor
  const actor = game.actors.get(actorId);
  if (!actor || !actor.isOwner) {
    ui.notifications.warn("You don't have permission to control this character's rolls.");
    return;
  }
  
  // Check if already processing
  if ($button.prop('disabled') || $button.hasClass('processing')) {
    console.log('🚫 Auto blow-up button already processing, ignoring click');
    return;
  }
  
  // Mark as processing immediately
  $button.addClass('processing').prop('disabled', true);
  
  const dieValue = parseInt($(this).data('die-value'));
  const currentDie = parseInt($(this).data('current-die'));
  const tokensNeeded = currentDie - dieValue;
  const currentTokens = Number(actor.system.turboTokens) || 0;
  
  debugLog(`💥 DEBUG: Auto blow-up - die value: ${dieValue}, current die: ${currentDie}, tokens needed: ${tokensNeeded}, available: ${currentTokens}`);
  
  if (tokensNeeded <= 0) {
    $button.prop('disabled', false).removeClass('processing');
    ui.notifications.warn("This die is already blown up or cannot be blown up.");
    return;
  }
  
  if (tokensNeeded > currentTokens) {
    $button.prop('disabled', false).removeClass('processing');
    ui.notifications.warn(`You need ${tokensNeeded} tokens to blow up this die, but only have ${currentTokens} available.`);
    return;
  }
  
  // Set the token input to the exact amount needed and trigger the combined button
  const $rollControls = $(this).closest('.roll-controls');
  const $tokenInput = $rollControls.find('.token-input');
  const $combinedBtn = $rollControls.find('.combined-roll-btn');
  
  $tokenInput.val(tokensNeeded);
  updateCombinedButtonText($rollControls);
  
  // Enable the combined button and reset our processing state
  $button.prop('disabled', false).removeClass('processing');
  
  // Trigger the combined button click
  $combinedBtn.trigger('click');
});

// Helper function to update injury warning display
function updateInjuryWarning($rollControls, injuryLevel, tokenRatio) {
  let $warningDiv = $rollControls.find('.injury-warning');
  
  if (injuryLevel >= 2) {
    if ($warningDiv.length === 0) {
      $warningDiv = $('<div class="injury-warning"></div>');
      $rollControls.find('.turbo-tokens-controls').append($warningDiv);
    }
    $warningDiv.html(`<i class="fas fa-exclamation-triangle"></i> <strong>Injured!</strong> Tokens cost ${tokenRatio}:1 due to injury level ${injuryLevel}`);
    $warningDiv.show();
  } else {
    $warningDiv.hide();
  }
}

// Helper function to get injury-adjusted token costs
function getInjuryAdjustedTokenInfo(actor, requestedTokens) {
  const injuryLevel = actor?.system?.injuries || 0;
  const tokenRatio = (injuryLevel >= 2) ? 2 : 1;
  const actualCost = requestedTokens * tokenRatio;
  const availableTokens = Number(actor?.system?.turboTokens) || 0;
  const maxAffordableTokens = Math.floor(availableTokens / tokenRatio);
  
  return {
    injuryLevel,
    tokenRatio,
    actualCost,
    availableTokens,
    maxAffordableTokens,
    canAfford: actualCost <= availableTokens
  };
}

// Helper function to update combined button text based on token input
function updateCombinedButtonText($rollControls) {
  const $tokenInput = $rollControls.find('.token-input');
  const $combinedBtn = $rollControls.find('.combined-roll-btn');
  const $btnText = $combinedBtn.find('.btn-text');
  
  const tokensToAdd = parseInt($tokenInput.val()) || 0;
  const originalTotal = parseInt($combinedBtn.data('final-total'));
  const currentDie = parseInt($combinedBtn.data('current-die'));
  const dieValue = parseInt($combinedBtn.data('die-value'));
  
  if (tokensToAdd === 0) {
    $btnText.text(`Accept Roll (Total: ${originalTotal})`);
    $combinedBtn.css('background', '#4CAF50');
  } else {
    const newDieResult = dieValue + tokensToAdd;
    const newTotal = originalTotal - dieValue + newDieResult;
    
    // Check if this will cause a blow-up
    if (newDieResult >= currentDie) {
      $btnText.text(`Add ${tokensToAdd} Tokens → BLOW UP!`);
      $combinedBtn.css('background', '#FF5722'); // Orange/red for blow-up
    } else {
      $btnText.text(`Add ${tokensToAdd} Tokens (New Total: ${newTotal})`);
      $combinedBtn.css('background', '#2196F3'); // Blue for normal add
    }
  }
}

// Helper function to get the next die size
function getNextDie(currentDie) {
  const dieSteps = [4, 6, 8, 10, 12, 20];
  const currentIdx = dieSteps.indexOf(currentDie);
  return currentIdx < dieSteps.length - 1 ? dieSteps[currentIdx + 1] : 20;
}

// Helper function to create interactive dice roll
async function createInteractiveDiceRoll(actor, stat, statValue, cumulativeTotal = 0, rollSequenceId = null) {
  debugLog('🎲🎲🎲 DEBUG: createInteractiveDiceRoll ENTRY POINT', {
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
      debugLog(`🚫 DEBUG: Roll sequence already active for ${actor.name} ${stat}`);
      
      // Prompt player to cancel previous roll
      const shouldCancel = await Dialog.confirm({
        title: "Previous Roll Active",
        content: `<p>You have an unfinished <strong>${stat.toUpperCase()}</strong> roll waiting for your decision.</p>
                 <p>Would you like to cancel the previous roll and start a new one?</p>`,
        yes: () => true,
        no: () => false,
        defaultYes: false
      });
      
      if (shouldCancel) {
        debugLog(`🗑️ DEBUG: Player chose to cancel previous ${stat} roll`);
        
        // Find and update the existing chat message to show it was cancelled
        const existingSequenceId = activeRollSequences.get(sequenceKey);
        if (existingSequenceId) {
          // Search recent chat messages for the one with this sequence ID
          const recentMessages = game.messages.contents.slice(-20); // Check last 20 messages
          for (const message of recentMessages) {
            if (message.content && message.content.includes(`data-sequence-id="${existingSequenceId}"`)) {
              debugLog(`📝 DEBUG: Found existing roll message to update: ${message.id}`);
              
              // Update the message content to show cancellation
              const $tempDiv = $('<div>').html(message.content);
              const $rollResult = $tempDiv.find('.nsbu-roll-result');
              
              if ($rollResult.length > 0) {
                // Update roll details to show cancellation
                $rollResult.find('.roll-details').append(' → CANCELLED');
                
                // Remove controls and observer message
                $rollResult.find('.roll-controls').remove();
                $rollResult.find('.roll-observer').remove();
                
                // Add cancellation notice
                $rollResult.append(`<div class="cancellation-notice">Roll cancelled by player</div>`);
                
                // Update the chat message
                await message.update({
                  content: $tempDiv.html()
                });
                
                debugLog(`✅ DEBUG: Updated chat message ${message.id} to show cancellation`);
              }
              break;
            }
          }
        }
        
        clearRollSequence(actor.id, stat, '(cancelled by player)');
        ui.notifications.info(`Previous ${stat.toUpperCase()} roll cancelled. Starting new roll...`);
        // Continue with the new roll by not returning
      } else {
        debugLog(`🚫 DEBUG: Player chose to keep previous ${stat} roll active`);
        ui.notifications.warn(`Previous ${stat.toUpperCase()} roll is still active. Please complete it before rolling again.`);
        return;
      }
    }
    
    // Mark this sequence as active
    activeRollSequences.set(sequenceKey, rollSequenceId);
    debugLog(`🔒 DEBUG: Started new roll sequence ${rollSequenceId} for ${actor.name} ${stat}`);
    
    // Set up auto-cleanup timeout (5 minutes)
    const timeoutId = setTimeout(() => {
      debugLog(`⏰ DEBUG: Auto-clearing abandoned roll sequence for ${actor.name} ${stat}`);
      clearRollSequence(actor.id, stat, '(timeout - abandoned)');
      ui.notifications.warn(`Abandoned roll sequence cleared for ${actor.name}'s ${stat.toUpperCase()} roll. You can roll again now.`);
    }, 5 * 60 * 1000); // 5 minutes
    
    rollSequenceTimeouts.set(sequenceKey, timeoutId);
    debugLog(`⏰ DEBUG: Set 5-minute timeout for ${actor.name} ${stat} roll sequence`);
  }
  
  debugLog(`🎲 DEBUG: createInteractiveDiceRoll called - actor: ${actor.name}, stat: ${stat}, statValue: ${statValue}, cumulativeTotal: ${cumulativeTotal}, sequenceId: ${rollSequenceId}`);
  
  const dieSteps = [4, 6, 8, 10, 12, 20];
  let dieIdx = dieSteps.indexOf(statValue);
  if (dieIdx === -1) {
    if (statValue === 100) {
      // Special case for d100 continued rolls
      dieIdx = 6; // Beyond the normal progression
    } else {
      dieIdx = 0;
    }
  }
  
  let currentDie = statValue === 100 ? 100 : dieSteps[dieIdx];
  
  debugLog(`🎲 DEBUG: Rolling d${currentDie} (index ${dieIdx})`);
  
  // Create and evaluate the roll
  const roll = new Roll(`1d${currentDie}`);
  await roll.evaluate();
  const rollValue = roll.total;
  
  debugLog(`🎲 DEBUG: Roll result: ${rollValue} on d${currentDie}`);
  
  // Update cumulative total with this roll
  const newCumulativeTotal = cumulativeTotal + rollValue;
  debugLog(`📊 DEBUG: Cumulative total: ${cumulativeTotal} + ${rollValue} = ${newCumulativeTotal}`);
  
  // Create the interactive chat message
  const rollId = foundry.utils.randomID();
  const currentTokens = Number(actor.system.turboTokens) || 0;
  
  // Check if this is a natural maximum (automatic blow-up)
  const isNaturalMax = (rollValue === currentDie);
  
  debugLog(`🎲 DEBUG: isNaturalMax: ${isNaturalMax}, currentTokens: ${currentTokens}`);
  
  let content;
  if (isNaturalMax) {
    // Natural maximum - automatic blow-up
    content = `
      <div class="nsbu-roll-result" data-roll-id="${rollId}">
        <div class="roll-details">Rolling ${stat.toUpperCase()} (d${currentDie}): ${rollValue} 🎯 NATURAL MAX!</div>
        <div class="blow-up-notice">💥 BLOW UP!<br/>${stat.toUpperCase()} upgraded to d${dieSteps[dieIdx + 1] || currentDie}!</div>
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
    debugLog(`🎯 DEBUG: Natural blow-up message created`);
    
    // Then immediately continue with the blow-up sequence
    if (dieIdx < dieSteps.length - 1) {
      const newDieIdx = dieIdx + 1;
      const newDie = dieSteps[newDieIdx];
      
      debugLog(`🎯 DEBUG: Upgrading stat from d${currentDie} to d${newDie}`);
      
      // Update actor's stat
      await actor.update({[`system.stats.${stat}`]: newDie});
      
      debugLog(`🎯 DEBUG: Stat upgraded, calling createInteractiveDiceRoll recursively for d${newDie}, sequenceId: ${rollSequenceId}`);
      
      // Create a new roll for the upgraded stat (recursive call)
      await createInteractiveDiceRoll(actor, stat, newDie, newCumulativeTotal, rollSequenceId);
    } else {
      // At maximum die (d20) - check setting for continued blow-ups
      const d20BlowUpSetting = game.settings.get("never-stop-blowing-up", "d20BlowUpDie");
      debugLog(`🎯 DEBUG: Maximum die reached (d20), d20BlowUpDie setting: ${d20BlowUpSetting}`);
      
      if (d20BlowUpSetting === "d100") {
        // Continue with d100 blow-up logic
        debugLog(`🎯 DEBUG: Continuing with d100 blow-up for ${stat}`);
        
        // Create a d100 roll for continued blow-up
        const d100Roll = new Roll("1d100");
        await d100Roll.evaluate();
        const d100Value = d100Roll.total;
        
        debugLog(`🎯 DEBUG: D100 roll result: ${d100Value}`);
        
        const d100Content = `
          <div class="nsbu-roll-result" data-roll-id="${rollId}" data-actor-id="${actor.id}">
            <div class="roll-details">Rolling ${stat.toUpperCase()} (d100 continued): ${d100Value}</div>
            <div class="roll-total">
              <span class="current-die-label">Current Die:</span> <span class="current-die-total">${d100Value}</span>
              <br/>Cumulative Total: <span class="cumulative-total">${newCumulativeTotal + d100Value}</span>
            </div>
            <div class="roll-controls" data-actor-id="${actor.id}" style="display: none;">
              <div class="turbo-tokens-section">
                <div class="turbo-tokens-controls">
                  <label>Turbo Tokens (<span class="available-tokens">${currentTokens}</span> Available):</label>
                  <div style="display: flex; align-items: center; gap: 5px; margin: 5px 0;">
                    <button type="button" class="token-decrease-btn" 
                      style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">−</button>
                    <input type="number" class="token-input" min="0" max="${currentTokens}" value="0" 
                      style="flex: 1; padding: 6px; text-align: center; box-sizing: border-box; border: 1px solid #999; border-radius: 3px;">
                    <button type="button" class="token-increase-btn" 
                      style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">+</button>
                    <button type="button" class="refresh-tokens-btn" 
                      data-roll-id="${rollId}"
                      data-actor-id="${actor.id}"
                      title="Refresh available token count"
                      style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">🔄</button>
                    <button type="button" class="auto-blowup-btn" 
                      data-roll-id="${rollId}"
                      data-actor-id="${actor.id}"
                      data-stat="${stat}"
                      data-die-value="${d100Value}"
                      data-current-die="100"
                      title="Automatically blow up this die"
                      ${(100 - d100Value) > currentTokens || (100 - d100Value) <= 0 ? 'disabled' : ''}
                      style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: ${(100 - d100Value) > currentTokens || (100 - d100Value) <= 0 ? '#e0e0e0' : '#f8f8f8'}; color: ${(100 - d100Value) > currentTokens || (100 - d100Value) <= 0 ? '#999' : '#000'}; cursor: ${(100 - d100Value) > currentTokens || (100 - d100Value) <= 0 ? 'not-allowed' : 'pointer'}; display: flex; align-items: center; justify-content: center; font-size: 14px;">💥</button>
                  </div>
                  <button type="button" class="combined-roll-btn" 
                    data-roll-id="${rollId}"
                    data-actor-id="${actor.id}"
                    data-stat="${stat}"
                    data-die-value="${d100Value}"
                    data-current-die="100"
                    data-current-die-idx="6"
                    data-cumulative-total="${newCumulativeTotal + d100Value}"
                    data-final-total="${newCumulativeTotal + d100Value}"
                    data-sequence-id="${rollSequenceId}"
                    style="width: 100%; padding: 8px; margin-top: 5px; background: #4CAF50; color: white; border: 1px solid #45a049; border-radius: 3px; cursor: pointer; font-weight: bold;">
                    <span class="btn-text">Accept Roll (Total: ${newCumulativeTotal + d100Value})</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="roll-observer" data-actor-id="${actor.id}">
              <em>Waiting for ${actor.name || 'the player'} to accept or modify this roll...</em>
            </div>
          </div>
        `;

        const d100ChatData = {
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: `${stat.toUpperCase()} D100 Continued Roll`,
          content: d100Content,
          rolls: [d100Roll],
          rollMode: game.settings.get("core", "rollMode"),
          sound: CONFIG.sounds.dice
        };

        await ChatMessage.create(d100ChatData);
      } else {
        // Continue with d20 rolls (setting: "d20")
        debugLog(`🎯 DEBUG: Continuing with d20 rolls (setting: ${d20BlowUpSetting})`);
        
        // Create another d20 roll for continued blow-up (stat stays at d20)
        const currentTokens = Number(actor.system.turboTokens) || 0;
        const rollId = foundry.utils.randomID();
        
        // Create a d20 roll
        const d20Roll = new Roll("1d20");
        await d20Roll.evaluate();
        const d20Value = d20Roll.total;
        
        debugLog(`🎯 DEBUG: D20 continuation roll result: ${d20Value}`);
        
        const d20Content = `
          <div class="nsbu-roll-result" data-roll-id="${rollId}" data-actor-id="${actor.id}">
            <div class="roll-details">Rolling ${stat.toUpperCase()} (d20 continued): ${d20Value}</div>
            <div class="roll-total">
              <span class="current-die-label">Current Die:</span> <span class="current-die-total">${d20Value}</span>
              <br/>Cumulative Total: <span class="cumulative-total">${newCumulativeTotal + d20Value}</span>
            </div>
            <div class="roll-controls" data-actor-id="${actor.id}" style="display: none;">
              <div class="turbo-tokens-section">
                <div class="turbo-tokens-controls">
                  <label>Turbo Tokens (<span class="available-tokens">${currentTokens}</span> Available):</label>
                  <div style="display: flex; align-items: center; gap: 5px; margin: 5px 0;">
                    <button type="button" class="token-decrease-btn" 
                      style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">−</button>
                    <input type="number" class="token-input" min="0" max="${currentTokens}" value="0" 
                      style="flex: 1; padding: 6px; text-align: center; box-sizing: border-box; border: 1px solid #999; border-radius: 3px;">
                    <button type="button" class="token-increase-btn" 
                      style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">+</button>
                    <button type="button" class="refresh-tokens-btn" 
                      data-roll-id="${rollId}"
                      data-actor-id="${actor.id}"
                      title="Refresh available token count"
                      style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">🔄</button>
                    <button type="button" class="auto-blowup-btn" 
                      data-roll-id="${rollId}"
                      data-actor-id="${actor.id}"
                      data-stat="${stat}"
                      data-die-value="${d20Value}"
                      data-current-die="20"
                      title="Automatically blow up this die"
                      ${(20 - d20Value) > currentTokens || (20 - d20Value) <= 0 ? 'disabled' : ''}
                      style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: ${(20 - d20Value) > currentTokens || (20 - d20Value) <= 0 ? '#e0e0e0' : '#f8f8f8'}; color: ${(20 - d20Value) > currentTokens || (20 - d20Value) <= 0 ? '#999' : '#000'}; cursor: ${(20 - d20Value) > currentTokens || (20 - d20Value) <= 0 ? 'not-allowed' : 'pointer'}; display: flex; align-items: center; justify-content: center; font-size: 14px;">💥</button>
                  </div>
                  <button type="button" class="combined-roll-btn" 
                    data-roll-id="${rollId}"
                    data-actor-id="${actor.id}"
                    data-stat="${stat}"
                    data-die-value="${d20Value}"
                    data-current-die="20"
                    data-current-die-idx="5"
                    data-cumulative-total="${newCumulativeTotal + d20Value}"
                    data-final-total="${newCumulativeTotal + d20Value}"
                    data-sequence-id="${rollSequenceId}"
                    style="width: 100%; padding: 8px; margin-top: 5px; background: #4CAF50; color: white; border: 1px solid #45a049; border-radius: 3px; cursor: pointer; font-weight: bold;">
                    <span class="btn-text">Accept Roll (Total: ${newCumulativeTotal + d20Value})</span>
                  </button>
                </div>
              </div>
            </div>
            <div class="roll-observer" data-actor-id="${actor.id}">
              <em>Waiting for ${actor.name || 'the player'} to accept or modify this roll...</em>
            </div>
          </div>
        `;

        const d20ChatData = {
          user: game.user.id,
          speaker: ChatMessage.getSpeaker({ actor }),
          flavor: `${stat.toUpperCase()} D20 Continued Roll`,
          content: d20Content,
          rolls: [d20Roll],
          rollMode: game.settings.get("core", "rollMode"),
          sound: CONFIG.sounds.dice
        };

        await ChatMessage.create(d20ChatData);
        
        // Clear the roll sequence as it's complete
        clearRollSequence(actor.id, stat, '(natural max die reached)');
      }
    }
    
  } else {
    // Normal roll - always show interactive controls (removed auto-accept for 0 tokens)
    content = `
      <div class="nsbu-roll-result" data-roll-id="${rollId}" data-actor-id="${actor.id}">
        <div class="roll-details">Rolling ${stat.toUpperCase()} (d${currentDie}): ${rollValue}</div>
        <div class="roll-total">
          <span class="current-die-label">Current Die:</span> <span class="current-die-total">${rollValue}</span>
          ${cumulativeTotal > 0 ? `<br/>Cumulative Total: <span class="cumulative-total">${newCumulativeTotal}</span>` : ''}
        </div>
        <div class="roll-controls" data-actor-id="${actor.id}" style="display: none;">
          <div class="turbo-tokens-section">
            <div class="turbo-tokens-controls">
              <label>Turbo Tokens (<span class="available-tokens">${currentTokens}</span> Available):</label>
              <div style="display: flex; align-items: center; gap: 5px; margin: 5px 0;">
                <button type="button" class="token-decrease-btn" 
                  style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">−</button>
                <input type="number" class="token-input" min="0" max="${currentTokens}" value="0" 
                  style="flex: 1; padding: 6px; text-align: center; box-sizing: border-box; border: 1px solid #999; border-radius: 3px;">
                <button type="button" class="token-increase-btn" 
                  style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; font-size: 16px; font-weight: bold;">+</button>
                <button type="button" class="refresh-tokens-btn" 
                  data-roll-id="${rollId}"
                  data-actor-id="${actor.id}"
                  title="Refresh available token count"
                  style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: #f8f8f8; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">🔄</button>
                <button type="button" class="auto-blowup-btn" 
                  data-roll-id="${rollId}"
                  data-actor-id="${actor.id}"
                  data-stat="${stat}"
                  data-die-value="${rollValue}"
                  data-current-die="${currentDie}"
                  title="Automatically blow up this die"
                  ${(currentDie - rollValue) > currentTokens || (currentDie - rollValue) <= 0 ? 'disabled' : ''}
                  style="width: 30px; height: 30px; border: 1px solid #999; border-radius: 3px; background: ${(currentDie - rollValue) > currentTokens || (currentDie - rollValue) <= 0 ? '#e0e0e0' : '#f8f8f8'}; color: ${(currentDie - rollValue) > currentTokens || (currentDie - rollValue) <= 0 ? '#999' : '#000'}; cursor: ${(currentDie - rollValue) > currentTokens || (currentDie - rollValue) <= 0 ? 'not-allowed' : 'pointer'}; display: flex; align-items: center; justify-content: center; font-size: 14px;">💥</button>
              </div>
              <button type="button" class="combined-roll-btn" 
                data-roll-id="${rollId}"
                data-actor-id="${actor.id}"
                data-stat="${stat}"
                data-die-value="${rollValue}"
                data-current-die="${currentDie}"
                data-current-die-idx="${dieIdx}"
                data-cumulative-total="${newCumulativeTotal}"
                data-final-total="${newCumulativeTotal}"
                data-sequence-id="${rollSequenceId}"
                style="width: 100%; padding: 8px; margin-top: 5px; background: #4CAF50; color: white; border: 1px solid #45a049; border-radius: 3px; cursor: pointer; font-weight: bold;">
                <span class="btn-text">Accept Roll (Total: ${newCumulativeTotal})</span>
              </button>
            </div>
          </div>
        </div>
        <div class="roll-observer" data-actor-id="${actor.id}">
          <em>Waiting for ${actor.name || 'the player'} to accept or modify this roll...</em>
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
    debugLog('🎭 DEBUG: NSBUActorSheet.activateListeners() called');
    super.activateListeners(html);
    const dieSteps = [4, 6, 8, 10, 12, 20];
    
    // Restore edit mode state if it was previously enabled
    const wasEditMode = this.editModeEnabled || false;
    const form = html.closest('form');
    const toggle = html.find('.edit-mode-toggle');
    const editControlledFields = html.find('.edit-controlled');
    
    if (wasEditMode) {
      form.addClass('edit-mode');
      toggle.addClass('active');
      editControlledFields.prop('readonly', false);
    } else {
      form.removeClass('edit-mode');
      toggle.removeClass('active');
      editControlledFields.prop('readonly', true);
    }
    
    // Edit Mode Toggle
    html.find('.edit-mode-toggle').on('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      debugLog('🔧 DEBUG: Edit mode toggle clicked (Actor)');
      
      const form = html.closest('form');
      const toggle = html.find('.edit-mode-toggle');
      const editControlledFields = html.find('.edit-controlled');
      
      if (form.hasClass('edit-mode')) {
        debugLog('🔧 DEBUG: Disabling edit mode');
        form.removeClass('edit-mode');
        toggle.removeClass('active');
        editControlledFields.prop('readonly', true);
        this.editModeEnabled = false;
      } else {
        debugLog('🔧 DEBUG: Enabling edit mode');
        form.addClass('edit-mode');
        toggle.addClass('active');
        editControlledFields.prop('readonly', false);
        this.editModeEnabled = true;
      }
    });
    
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

    // New Episode button
    html.find('.new-episode-btn').on('click', async (event) => {
      event.preventDefault();
      
      // Confirm dialog
      const confirmed = await Dialog.confirm({
        title: "Start New Episode",
        content: "<p>This will reset Turbo Tokens and Tokens Spent to 0.</p><p>Injuries will remain unchanged.</p><p>Are you sure you want to start a new episode?</p>",
        yes: () => true,
        no: () => false,
        defaultYes: false
      });
      
      if (confirmed) {
        await this.actor.update({
          'system.turboTokens': 0,
          'system.tokensSpentThisEpisode': 0
        });
        
        ui.notifications.info(`${this.actor.name} started a new episode! Turbo tokens and episode spending reset.`);
        this.render();
      }
    });
    
    // Remove ability buttons
    html.find('.remove-ability').on('click', async (event) => {
      event.preventDefault();
      const itemId = event.currentTarget.dataset.itemId;
      const item = this.actor.items.get(itemId);
      
      if (!item) {
        ui.notifications.error('Ability not found!');
        return;
      }
      
      // Confirm deletion
      const confirmed = await Dialog.confirm({
        title: "Remove Ability",
        content: `<p>Are you sure you want to remove <strong>${item.name}</strong>?</p>`,
        yes: () => true,
        no: () => false,
        defaultYes: false
      });
      
      if (confirmed) {
        await item.delete();
        ui.notifications.info(`${item.name} removed from ${this.actor.name}.`);
      }
    });
    
    // Roll stat buttons - ACTOR SHEET
    debugLog('🎲 DEBUG: NSBUActorSheet - Setting up .stat-roll click handler');
    const rollStatButtons = html.find('.stat-roll');
    debugLog('🎲 DEBUG: NSBUActorSheet - Found stat-roll buttons:', rollStatButtons.length);
    
    rollStatButtons.on('click', async (event) => {
      debugLog('🎲 DEBUG: NSBUActorSheet - Roll stat button clicked!', event);
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      debugLog('🎲 DEBUG: NSBUActorSheet - Stat from button:', stat);
      const stats = this.actor.system.stats || {};
      debugLog('🎲 DEBUG: NSBUActorSheet - Actor stats:', stats);
      let statValue = Number(stats[stat]);
      debugLog('🎲 DEBUG: NSBUActorSheet - Stat value:', statValue);
      if (!statValue || ![4,6,8,10,12,20].includes(statValue)) {
        debugLog('🎲 DEBUG: NSBUActorSheet - Invalid stat value, defaulting to 4');
        statValue = 4;
      }
      
      debugLog('🎲 DEBUG: NSBUActorSheet - About to call createInteractiveDiceRoll with:', {
        actor: this.actor.name,
        stat: stat,
        statValue: statValue
      });
      
      try {
        await createInteractiveDiceRoll(this.actor, stat, statValue);
        debugLog('🎲 DEBUG: NSBUActorSheet - createInteractiveDiceRoll completed successfully');
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
      
      // Special case: when name is changed, also update system.realWorldCharacter to keep them in sync
      if (name === 'name') {
        debugLog('🎭 DEBUG: Name field change detected in CHARACTER SHEET');
        debugLog('🎭 DEBUG: Original value from input:', value);
        debugLog('🎭 DEBUG: Input type:', input.type);
        debugLog('🎭 DEBUG: Current actor name:', this.actor.name);
        
        // Use the value as provided, let template handle defaults
        const actualValue = value ? value.trim() : '';
        debugLog('🎭 DEBUG: Processed value to save:', actualValue);
        
        await this.actor.update({ 
          'name': actualValue,
          'system.realWorldCharacter': actualValue 
        });
        
        debugLog('🎭 DEBUG: Actor update completed');
        debugLog('🎭 DEBUG: New actor name after update:', this.actor.name);
        
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

    // Portrait image click handler
    debugLog('🖼️ DEBUG: Setting up portrait click handler for CHARACTER SHEET');
    const portraitImg = html.find('.nsbu-portrait img');
    debugLog('🖼️ DEBUG: Found portrait img elements:', portraitImg.length);
    debugLog('🖼️ DEBUG: Portrait img element:', portraitImg[0]);
    
    portraitImg.on('click', (event) => {
      debugLog('🖼️ DEBUG: Portrait image clicked in CHARACTER SHEET!');
      event.preventDefault();
      event.stopPropagation();
      
      debugLog('🖼️ DEBUG: Creating FilePicker...');
      const fp = new FilePicker({
        type: "image",
        callback: async (imagePath) => {
          debugLog('🖼️ DEBUG: FilePicker callback - selected image:', imagePath);
          await this.actor.update({ img: imagePath });
          debugLog('🖼️ DEBUG: Actor image updated successfully');
          debugLog('🖼️ DEBUG: Re-rendering sheet to show new portrait...');
          this.render();
        },
        top: this.position.top + 40,
        left: this.position.left + 10
      });
      
      debugLog('🖼️ DEBUG: Opening FilePicker browser...');
      fp.browse();
    });
    
    // Also add click handler to the portrait div itself as fallback
    const portraitDiv = html.find('.nsbu-portrait');
    debugLog('🖼️ DEBUG: Found portrait div elements:', portraitDiv.length);
    portraitDiv.on('click', (event) => {
      debugLog('🖼️ DEBUG: Portrait div clicked in CHARACTER SHEET!');
      event.preventDefault();
      event.stopPropagation();
      
      const fp = new FilePicker({
        type: "image",
        callback: async (imagePath) => {
          debugLog('🖼️ DEBUG: FilePicker callback (div) - selected image:', imagePath);
          await this.actor.update({ img: imagePath });
          debugLog('🖼️ DEBUG: Actor image updated successfully (div)');
          debugLog('🖼️ DEBUG: Re-rendering sheet to show new portrait (div)...');
          this.render();
        },
        top: this.position.top + 40,
        left: this.position.left + 10
      });
      
      fp.browse();
    });
  }

  getData(options) {
    const data = super.getData(options);
    data.system = this.actor.system ?? {};
    data.items = this.actor.items ? this.actor.items.contents : [];
    
    debugLog('🎭 DEBUG: CHARACTER SHEET getData called');
    debugLog('🎭 DEBUG: Actor name from this.actor.name:', this.actor.name);
    debugLog('🎭 DEBUG: Actor ID:', this.actor.id);
    debugLog('🎭 DEBUG: tokensSpentThisEpisode value:', data.system.tokensSpentThisEpisode);
    debugLog('🎭 DEBUG: Name in data object BEFORE fix:', data.name);
    debugLog('🎭 DEBUG: realWorldCharacter:', data.system.realWorldCharacter);
    
    // DEBUG: Check image properties
    debugLog('🖼️ DEBUG: Actor img property:', this.actor.img);
    debugLog('🖼️ DEBUG: Data img property:', data.img);
    debugLog('🖼️ DEBUG: Full data object keys:', Object.keys(data));
    
    // FIX: Ensure data.name is set properly
    if (!data.name) {
      data.name = this.actor.name;
      debugLog('🎭 DEBUG: Fixed data.name to:', data.name);
    }
    
    // FIX: Ensure data.img is set properly
    if (!data.img && this.actor.img) {
      data.img = this.actor.img;
      debugLog('🖼️ DEBUG: Fixed data.img to:', data.img);
    }
    
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
    debugLog('🎭 DEBUG: CHARACTER SHEET _updateObject called');
    debugLog('🎭 DEBUG: formData received:', formData);
    
    // Handle name field specially to ensure synchronization
    if (formData.hasOwnProperty('name')) {
      debugLog('🎭 DEBUG: Name field found in formData:', formData.name);
      formData['system.realWorldCharacter'] = formData.name;
      debugLog('🎭 DEBUG: Modified formData:', formData);
    }
    
    await this.actor.update(formData);
    debugLog('🎭 DEBUG: Actor update completed in _updateObject');
  }
}

class NSBUNPCSheet extends ActorSheet {
  activateListeners(html) {
    super.activateListeners(html);
    const dieSteps = [4, 6, 8, 10, 12, 20];
    
    // Restore edit mode state if it was previously enabled
    const wasEditMode = this.editModeEnabled || false;
    const form = html.closest('form');
    const toggle = html.find('.edit-mode-toggle');
    const editControlledFields = html.find('.edit-controlled');
    
    if (wasEditMode) {
      form.addClass('edit-mode');
      toggle.addClass('active');
      editControlledFields.prop('readonly', false);
    } else {
      form.removeClass('edit-mode');
      toggle.removeClass('active');
      editControlledFields.prop('readonly', true);
    }
    
    // Edit Mode Toggle
    html.find('.edit-mode-toggle').on('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      debugLog('🔧 DEBUG: Edit mode toggle clicked (NPC)');
      
      const form = html.closest('form');
      const toggle = html.find('.edit-mode-toggle');
      const editControlledFields = html.find('.edit-controlled');
      
      if (form.hasClass('edit-mode')) {
        debugLog('🔧 DEBUG: Disabling edit mode');
        form.removeClass('edit-mode');
        toggle.removeClass('active');
        editControlledFields.prop('readonly', true);
        this.editModeEnabled = false;
      } else {
        debugLog('🔧 DEBUG: Enabling edit mode');
        form.addClass('edit-mode');
        toggle.addClass('active');
        editControlledFields.prop('readonly', false);
        this.editModeEnabled = true;
      }
    });
    
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

    // New Episode button
    html.find('.new-episode-btn').on('click', async (event) => {
      event.preventDefault();
      
      // Confirm dialog
      const confirmed = await Dialog.confirm({
        title: "Start New Episode",
        content: "<p>This will reset Turbo Tokens and Tokens Spent to 0.</p><p>Injuries will remain unchanged.</p><p>Are you sure you want to start a new episode?</p>",
        yes: () => true,
        no: () => false,
        defaultYes: false
      });
      
      if (confirmed) {
        await this.actor.update({
          'system.turboTokens': 0,
          'system.tokensSpentThisEpisode': 0
        });
        
        ui.notifications.info(`${this.actor.name} started a new episode! Turbo tokens and episode spending reset.`);
        this.render();
      }
    });
    
    // Remove ability buttons
    html.find('.remove-ability').on('click', async (event) => {
      event.preventDefault();
      const itemId = event.currentTarget.dataset.itemId;
      const item = this.actor.items.get(itemId);
      
      if (!item) {
        ui.notifications.error('Ability not found!');
        return;
      }
      
      // Confirm deletion
      const confirmed = await Dialog.confirm({
        title: "Remove Ability",
        content: `<p>Are you sure you want to remove <strong>${item.name}</strong>?</p>`,
        yes: () => true,
        no: () => false,
        defaultYes: false
      });
      
      if (confirmed) {
        await item.delete();
        ui.notifications.info(`${item.name} removed from ${this.actor.name}.`);
      }
    });
    
    // Roll stat buttons - NPC SHEET
    debugLog('🎲 DEBUG: NSBUNPCSheet - Setting up .stat-roll click handler');
    const rollStatButtons = html.find('.stat-roll');
    debugLog('🎲 DEBUG: NSBUNPCSheet - Found stat-roll buttons:', rollStatButtons.length);
    
    rollStatButtons.on('click', async (event) => {
      debugLog('🎲 DEBUG: NSBUNPCSheet - Stat roll button clicked!', event);
      event.preventDefault();
      const stat = event.currentTarget.dataset.stat;
      debugLog('🎲 DEBUG: NSBUNPCSheet - Stat from button:', stat);
      const stats = this.actor.system.stats || {};
      debugLog('🎲 DEBUG: NSBUNPCSheet - Actor stats:', stats);
      let statValue = Number(stats[stat]);
      debugLog('🎲 DEBUG: NSBUNPCSheet - Stat value:', statValue);
      if (!statValue || ![4,6,8,10,12,20].includes(statValue)) {
        debugLog('🎲 DEBUG: NSBUNPCSheet - Invalid stat value, defaulting to 4');
        statValue = 4;
      }
      
      debugLog('🎲 DEBUG: NSBUNPCSheet - About to call createInteractiveDiceRoll with:', {
        actor: this.actor.name,
        stat: stat,
        statValue: statValue
      });
      
      try {
        await createInteractiveDiceRoll(this.actor, stat, statValue);
        debugLog('🎲 DEBUG: NSBUNPCSheet - createInteractiveDiceRoll completed successfully');
      } catch (error) {
        console.error('🎲 ERROR: NSBUNPCSheet - createInteractiveDiceRoll failed:', error);
      }
    });
    
    // Other input listeners
    html.find('input, select, textarea').on('change blur', async (event) => {
      const input = event.currentTarget;
      const name = input.name;
      let value = input.value;
      
      // Special case: when name is changed, also update system.realWorldCharacter to keep them in sync
      if (name === 'name') {
        debugLog('🎭 DEBUG: Name field change detected in NPC SHEET');
        debugLog('🎭 DEBUG: Original value from input:', value);
        debugLog('🎭 DEBUG: Input type:', input.type);
        debugLog('🎭 DEBUG: Current actor name:', this.actor.name);
        
        // Use the value as provided, let template handle defaults
        const actualValue = value ? value.trim() : '';
        debugLog('🎭 DEBUG: Processed value to save:', actualValue);
        
        await this.actor.update({ 
          'name': actualValue,
          'system.realWorldCharacter': actualValue 
        });
        
        debugLog('🎭 DEBUG: Actor update completed');
        debugLog('🎭 DEBUG: New actor name after update:', this.actor.name);
        
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

    // Portrait image click handler
    debugLog('🖼️ DEBUG: Setting up portrait click handler for NPC SHEET');
    const npcPortraitImg = html.find('.nsbu-portrait img');
    debugLog('🖼️ DEBUG: Found NPC portrait img elements:', npcPortraitImg.length);
    debugLog('🖼️ DEBUG: NPC Portrait img element:', npcPortraitImg[0]);
    
    npcPortraitImg.on('click', (event) => {
      debugLog('🖼️ DEBUG: Portrait image clicked in NPC SHEET!');
      event.preventDefault();
      event.stopPropagation();
      
      debugLog('🖼️ DEBUG: Creating FilePicker for NPC...');
      const fp = new FilePicker({
        type: "image",
        callback: async (imagePath) => {
          debugLog('🖼️ DEBUG: FilePicker callback (NPC) - selected image:', imagePath);
          await this.actor.update({ img: imagePath });
          debugLog('🖼️ DEBUG: NPC Actor image updated successfully');
          debugLog('🖼️ DEBUG: Re-rendering NPC sheet to show new portrait...');
          this.render();
        },
        top: this.position.top + 40,
        left: this.position.left + 10
      });
      
      debugLog('🖼️ DEBUG: Opening FilePicker browser for NPC...');
      fp.browse();
    });
    
    // Also add click handler to the portrait div itself as fallback for NPC
    const npcPortraitDiv = html.find('.nsbu-portrait');
    debugLog('🖼️ DEBUG: Found NPC portrait div elements:', npcPortraitDiv.length);
    npcPortraitDiv.on('click', (event) => {
      debugLog('🖼️ DEBUG: Portrait div clicked in NPC SHEET!');
      event.preventDefault();
      event.stopPropagation();
      
      const fp = new FilePicker({
        type: "image",
        callback: async (imagePath) => {
          debugLog('🖼️ DEBUG: FilePicker callback (NPC div) - selected image:', imagePath);
          await this.actor.update({ img: imagePath });
          debugLog('🖼️ DEBUG: NPC Actor image updated successfully (div)');
          debugLog('🖼️ DEBUG: Re-rendering NPC sheet to show new portrait (div)...');
          this.render();
        },
        top: this.position.top + 40,
        left: this.position.left + 10
      });
      
      fp.browse();
    });
  }

  getData(options) {
    const data = super.getData(options);
    data.system = this.actor.system ?? {};
    data.items = this.actor.items ? this.actor.items.contents : [];
    
    debugLog('🎭 DEBUG: NPC SHEET getData called');
    debugLog('🎭 DEBUG: Actor name from this.actor.name:', this.actor.name);
    debugLog('🎭 DEBUG: Actor ID:', this.actor.id);
    debugLog('🎭 DEBUG: tokensSpentThisEpisode value:', data.system.tokensSpentThisEpisode);
    debugLog('🎭 DEBUG: Name in data object BEFORE fix:', data.name);
    debugLog('🎭 DEBUG: realWorldCharacter:', data.system.realWorldCharacter);
    
    // DEBUG: Check image properties for NPC
    debugLog('🖼️ DEBUG: NPC Actor img property:', this.actor.img);
    debugLog('🖼️ DEBUG: NPC Data img property:', data.img);
    debugLog('🖼️ DEBUG: NPC Full data object keys:', Object.keys(data));
    
    // FIX: Ensure data.name is set properly
    if (!data.name) {
      data.name = this.actor.name;
      debugLog('🎭 DEBUG: Fixed data.name to:', data.name);
    }
    
    // FIX: Ensure data.img is set properly for NPC
    if (!data.img && this.actor.img) {
      data.img = this.actor.img;
      debugLog('🖼️ DEBUG: Fixed NPC data.img to:', data.img);
    }
    
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
    debugLog('🎭 DEBUG: NPC SHEET _updateObject called');
    debugLog('🎭 DEBUG: formData received:', formData);
    
    // Handle name field specially to ensure synchronization
    if (formData.hasOwnProperty('name')) {
      debugLog('🎭 DEBUG: Name field found in formData:', formData.name);
      formData['system.realWorldCharacter'] = formData.name;
      debugLog('🎭 DEBUG: Modified formData:', formData);
    }
    
    await this.actor.update(formData);
    debugLog('🎭 DEBUG: Actor update completed in _updateObject');
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
  
  // Register game settings
  game.settings.register("never-stop-blowing-up", "d20BlowUpDie", {
    name: "D20 Blow-Up Die",
    hint: "When a d20 stat blows up, what die should be rolled for continued blow-ups?",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "d20": "Continue with d20",
      "d100": "Upgrade to d100"
    },
    default: "d20"
  });

  game.settings.register("never-stop-blowing-up", "enableDebugLogging", {
    name: "Enable Debug Logging",
    hint: "Developers only. Enables debug logging in the application console.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    onChange: (value) => {
      console.log(`🔧 NSBU Debug Logging ${value ? 'ENABLED' : 'DISABLED'} - Future debug messages will ${value ? 'appear' : 'be hidden'}`);
    }
  });
  
  console.log("=== NSBU game settings registered ===");
  
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
        pack.getDocuments().then(async docs => {
          console.log(`  - Contains ${docs.length} rules reference entries`);
          console.log("  - Rules reference compendium loaded successfully");
          
          // Fix permissions for all rules reference documents
          for (const doc of docs) {
            console.log(`    • ${doc.name} (${doc.system?.type})`);
            
            // Check if the document needs permission fix
            if (doc.ownership?.default !== 2) {
              try {
                await doc.update({
                  ownership: {
                    ...doc.ownership,
                    default: 2  // OBSERVER permission for all players
                  }
                });
                console.log(`    ✓ Fixed permissions for ${doc.name}`);
              } catch (err) {
                console.warn(`    ⚠ Could not fix permissions for ${doc.name}:`, err.message);
              }
            }
          }
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

// Hook to control visibility of roll controls based on actor ownership
Hooks.on("renderChatMessage", (message, html, data) => {
  // Find all roll results in this message
  const rollResults = html.find('.nsbu-roll-result');
  
  rollResults.each(function() {
    const $rollResult = $(this);
    const actorId = $rollResult.data('actor-id');
    
    if (actorId) {
      const actor = game.actors.get(actorId);
      const canControl = actor && actor.isOwner;
      
      const $controls = $rollResult.find('.roll-controls');
      const $observer = $rollResult.find('.roll-observer');
      
      debugLog(`🔐 DEBUG: Chat render - User ${game.user.name} can control actor ${actor?.name}: ${canControl}`);
      debugLog(`🔐 DEBUG: Found controls: ${$controls.length}, observer: ${$observer.length}`);
      
      if (canControl) {
        // Show controls, hide observer message
        debugLog(`🔐 DEBUG: Owner - showing controls, hiding observer`);
        $controls.show();
        $observer.hide();
        
        // Initialize injury warning if needed
        const actorId = $controls.data('actor-id');
        const actor = game.actors.get(actorId);
        if (actor) {
          const tokenInfo = getInjuryAdjustedTokenInfo(actor, 0);
          updateInjuryWarning($controls, tokenInfo.injuryLevel, tokenInfo.tokenRatio);
        }
      } else {
        // Hide controls, show observer message
        debugLog(`🔐 DEBUG: Non-owner - hiding controls, showing observer`);
        $controls.hide();
        $observer.show();
      }
    }
  });
});




