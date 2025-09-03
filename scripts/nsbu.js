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
    return this.object.update(formData);
  }
}

Hooks.once("init", () => {
  Actors.registerSheet("never-stop-blowing-up", NSBUActorSheet, {
    types: ["character"],
    makeDefault: true
  });
});
