class NSBUActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["never-stop-blowing-up", "sheet", "actor"],
      template: "systems/never-stop-blowing-up/sheet.html",
      width: 600,
      height: 400
    });
  }

  async _updateObject(event, formData) {
    console.log("Updating actor with:", formData);
    await this.actor.update(formData);
  }
}

Hooks.once("init", () => {
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
          boomLevel: { type: Number, default: 1 }
        }
      }
    }
  };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("never-stop-blowing-up", NSBUActorSheet, {
    types: ["character"],
    makeDefault: true
  });
});
