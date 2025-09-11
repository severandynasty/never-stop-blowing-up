// Helper function to create interactive dice roll chat messages for player characters
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
