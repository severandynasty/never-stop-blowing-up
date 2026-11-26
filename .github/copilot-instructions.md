# Copilot instructions

This repository is a Foundry VTT game system. Its runtime entry point is `scripts/nsbu.js`; actor and item defaults are in `template.json`, and the system manifest is `system.json`.

## Development

- Read relevant specifications in `specs/` before making changes. Compare them with the current implementation; report conflicts rather than silently choosing a new behavior.
- Preserve gameplay behavior unless a change is explicitly requested. Keep changes small, focused, and limited to the task.
- When changing rules, update the relevant specification and create or update focused tests. Preserve documented edge cases unless the requested change says otherwise.
- Prefer extracting deterministic rule calculations into pure functions, separate from Foundry documents, hooks, and UI code. Do not combine an extraction with unrelated gameplay changes.
- Preserve existing-world data and behavior unless instructed otherwise. Report assumptions, compatibility impacts, and anything not verified.
- Run `npm test` (Vitest) before concluding work. Report failures or blockers explicitly. Vitest runs in Node; mocked tests do not establish that behavior works in Foundry.

## Foundry-specific guidance

- Preserve the compatibility range in `system.json` unless a version change is requested. The manifest currently targets Foundry V12, verified against 12.343.
- Respect Foundry lifecycle hooks and existing sheet registrations. Keep actor and item document updates, UI event handling, and chat message operations consistent with the relevant hooks and APIs.
- Preserve existing actor and item types, `system` field paths, settings, embedded items, and compendium document IDs. If a data-format change is necessary, account for existing worlds with an explicit migration and verification.
- Check actor ownership before roll or token mutations. Consider stale chat controls, concurrent clients, and failures between document updates; do not treat hidden UI controls as authorization.
- Use Foundry's `Roll` and document APIs for Foundry interactions. Keep templates, chat rendering, and styles scoped to the system; safely handle dynamic content.
- Check both character and NPC sheets when changing shared behavior. Test in Foundry when the change depends on its runtime, and state clearly when that verification was not possible.
- Ability CSVs and compendium packs have separate source and generated representations. The current compendium build generates new IDs; do not rebuild packs incidentally or overwrite unrelated content. Review IDs, assets, and generated diffs when a requested change requires a rebuild.
