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
    await this.actor.update(formData);
  }
}

Hooks.once("init", () => {
  CONFIG.Actor.sheetClasses["character"] = {};
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("never-stop-blowing-up", NSBUActorSheet, {
    types: ["character"],
    makeDefault: true
  });
});
