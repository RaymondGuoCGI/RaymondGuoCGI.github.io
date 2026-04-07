# douyin-auto-publish

Build an AI-assisted, one-click (or near one-click) Douyin publishing workflow with compliance-first checks.

## When to use
- You want to publish Douyin content repeatedly with minimal manual form filling.
- You need AI to generate title, summary, hashtags, and posting variants.
- You want browser/manual fallback when API coverage is incomplete.

## Reality check (must read)
- Full "zero-click publish everything" is not guaranteed for all account types.
- Official OpenAPI publish ability requires open platform app setup, scopes, and user authorization.
- Some UI-only operations (for certain music selections, page-only controls, account-specific features) may still require manual confirmation.
- Never bypass platform rules; avoid credential scraping or anti-bot circumvention.

## Inputs
- `CONTENT_SOURCE`: script/article/notes or media assets.
- `ACCOUNT_MODE`: `openapi` or `browser_fallback`.
- `PUBLISH_TARGET`: `video` or `image_text`.
- `VOICE`: style constraints for AI copy.
- `TOPIC_POLICY`: required/forbidden topics.

## Outputs
- AI-generated publish package:
  - `title`
  - `summary`
  - `hashtags` (merged into text if needed)
  - `publish_text`
  - optional `cover_suggestions`
- Publish execution result:
  - draft id / item id (if API returns)
  - status snapshot
  - error report with retry hints

## Workflow
1. Validate prerequisites
   - Confirm Douyin Open Platform app exists.
   - Confirm required scopes are approved.
   - Confirm valid user authorization token is available.
2. Generate copy with AI
   - Produce 3 candidate sets of title/summary/topic tags.
   - Apply policy filter (blacklist words, risky claims, regulated terms).
   - Choose best candidate automatically via scoring rubric.
3. Build final publish payload
   - Merge title + hashtags into platform text field format.
   - Attach media ids (uploaded beforehand if required by endpoint).
   - Apply schedule/immediate publish setting.
4. Publish
   - `openapi` mode: call official create endpoint for selected target.
   - `browser_fallback` mode: prefill fields in browser automation and pause for human final confirm click.
5. Verify + log
   - Poll/query item status when endpoint supports it.
   - Persist request/response + final url/id for traceability.

## Quick Start
1. Create `config.local.json` with:
   - `client_key`
   - `client_secret`
   - `redirect_uri`
   - `default_topics`
   - `safety_rules`
2. Implement two actions in your runner (Node/Python/n8n are all fine):
   - `generate_publish_package(input)`
   - `publish_to_douyin(package, mode)`
3. Start in `browser_fallback` for first 3 runs, then switch to `openapi` once fields map cleanly.
4. Keep a mandatory human-review toggle for compliance-sensitive accounts.

## Recommended architecture
- Orchestrator: n8n / Make / custom Node service
- AI layer: prompt template + structured JSON output
- Persistence: sqlite/notion/airtable for publish logs
- Execution:
  - Primary: Douyin OpenAPI
  - Fallback: Playwright prefill + manual final click

## Prompt template (minimal)
Use this with your model and require strict JSON output:

```text
You are a Douyin content editor.
Input:
- Topic: {{topic}}
- Audience: {{audience}}
- Source: {{source_text}}
- Style: {{voice}}
- Required hashtags: {{required_hashtags}}
- Forbidden terms: {{forbidden_terms}}

Return JSON:
{
  "candidates": [
    {
      "title": "...",
      "summary": "...",
      "hashtags": ["#..."],
      "publish_text": "..."
    }
  ]
}
Rules:
- Keep claims verifiable.
- No forbidden terms.
- Optimize for concise mobile reading.
```

## Safety checklist
- Confirm authorization is explicit and revocable.
- Respect platform rate limits and policy terms.
- Log every publish action with timestamp and payload hash.
- Keep kill-switch: one env flag to disable auto publish immediately.

## Definition of done
- One command triggers: content ingest -> AI copy -> publish attempt -> status log.
- At least one successful publish in test environment/account.
- Fallback path works when API field mapping is missing.
