## TickTick
<!-- ticktick-link: {"folder": "📂Elivate", "folderId": "6ae1a83f8ca391126c442bc1", "list": "⚙️Boko Isaac 2.0", "listId": "6ae1a8258f0890366fef5b34"} -->
This repo is tracked in TickTick: **📂Elivate / ⚙️Boko Isaac 2.0**. Use the `ticktick` skill for full rules. Helper: `python3 ~/.claude/skills/ticktick/scripts/tt.py` (`context`, `show`, `move`, `comment`, `proof`).

Rules for any agent working here (no need to ask the user for these):
- **Starting a task** → `tt.py move <taskId> "In Progress"` (adds the `now` tag and makes it this repo's current task; commits get logged on it automatically).
- **Work is ready for the user** → move it to `Review` and add proof (`tt.py proof <taskId> <screenshot> --note "..."`, or `tt.py comment <taskId> -` for text/logs). Opening a PR with `gh pr create` does this automatically.
- **Never** move a task to `Completed`, create/delete tasks or lists, or change due dates without the user's OK. Merged PRs complete tasks automatically.
- If work doesn't match any task, tell the user and propose a task — don't create it silently.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
