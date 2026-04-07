# OmniCode Agent Rules

## Mandatory Progress Workflow

1. At session start, always check `.opencode/progress.md` first.
2. If `.opencode/progress.md` exists:
   - Read it and summarize: `Current Objective`, `Completed`, `In Progress`, `Next Queue`, `Blockers`.
   - Continue work from `In Progress` first.
3. If `.opencode/progress.md` does not exist:
   - Create it using the task-progress template.
   - Mark status as `fresh-start`.

## Mandatory Update Before Pause/Exit

Before any interruption, handoff, or stopping point, always update `.opencode/progress.md`:

- `Last Updated`
- `Project Status`
- `Progress`
- `Current Objective`
- `Completed`
- `In Progress` (at most one item)
- `Next Queue` (prioritized)
- `Blockers`
- `Resume Prompt`

## Skill Enforcement

- If available, use `task-progress` skill for progress management.
- Do not end a work turn with stale progress data.

