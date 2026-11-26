Perform a behavior-preserving extraction.

Requirements:

1. Read the specification.
2. Read existing tests.
3. Create a new rules module.
4. Move only gameplay logic.
5. Leave Foundry integration in place.
6. Leave UI logic in place.
7. Leave chat rendering in place.
8. Preserve behavior exactly.

Validation:

- Run tests.
- Report changed files.
- Report updated call sites.

If preserving behavior conflicts with cleanup, preserve behavior.