# Project Progress

- Last Updated: 2026-03-03 22:21 (local)
- Project Status: active
- Progress: 68%

## Current Objective
- Stabilize OmniCode multi-provider runtime and align UI interactions with provider/model logic.

## Completed
- [x] Fixed plugin enable conflict by using unique view type (`omnicode-view`).
- [x] Updated plugin metadata: version `1.4.1`, author `Raymond Guo`.
- [x] Changed plugin branding in panel/title/icon to OmniCode-facing values.
- [x] Added in-panel provider switch (`Claude/Codex/Gemini/OpenAI-compatible`).
- [x] Fixed Codex CLI invalid args (`-a`) and non-git directory failure (`--skip-git-repo-check`).
- [x] Fixed Claude AbortSignal compatibility crash in `setMaxListeners`.
- [x] Fixed Claude startup exit code 1 by adding `--print` for stream-json mode.
- [x] Added guards for dynamic update APIs (`setMaxThinkingTokens/setPermissionMode/setMcpServers`) to reduce false error notices.
- [x] Synced toolbar model display with selected provider state (Codex/Gemini/API labels).

## In Progress
- [ ] Refine provider/model UI behavior to match expected UX (header provider selector + input toolbar model selector consistency).

## Next Queue
- [ ] Provider selector UX: do not show fixed "Provider:" label above the select; show placeholder-style text inside select when idle, hide label semantics on open/select.
- [ ] Fix lower-left input toolbar model selector interaction so model can be selected reliably after provider changes.
- [ ] Align `openai_compatible` (4th dropdown option) UI and backend settings behavior end-to-end (connection mode, fields, runtime routing, validation).
- [ ] Add compatibility fallback/error hints for Claude/Gemini/Codex command failures with actionable remediation text.
- [ ] Regression pass: Claude/Codex/Gemini/OpenAI-compatible send flow + provider switching + restart behavior.

## Blockers
- None currently. User validation feedback pending on updated UI interaction details.

## Resume Prompt
Continue from `.opencode/progress.md`. Finish `In Progress` first, then execute `Next Queue` top-down. Prioritize provider selector UX and input-toolbar model selection reliability.
