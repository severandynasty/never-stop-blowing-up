export function getInjuryAdjustedTokenInfo(actor, requestedTokens) {
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
