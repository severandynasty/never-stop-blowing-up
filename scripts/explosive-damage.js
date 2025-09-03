Hooks.on("ready", () => {
  game.neverStopBlowingUp.rollExplosiveDamage = item => {
    const damage = item.system.damage || 10;
    const roll = new Roll(`${damage}`);
    roll.roll({async: false});
    roll.toMessage({
      speaker: ChatMessage.getSpeaker(),
      flavor: `Explosion! ${item.name} goes off!`
    });
  };
});
