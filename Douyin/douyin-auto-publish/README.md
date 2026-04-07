# Douyin Auto Publish (Scaffold)

## 1) Prepare files
- `config.example.json` -> `config.local.json`
- `input.example.json` -> `input.local.json`

## 2) Install
```powershell
npm install
```

## 3) OAuth: get token
1. Fill `clientKey`, `clientSecret`, `redirectUri`, `scope` in `config.local.json`
2. Generate authorization URL:

```powershell
npm run auth-url
```

3. Open returned URL in browser, authorize, copy `code` from callback URL.
4. Exchange code:

```powershell
npm run token:exchange -- --code=YOUR_CODE
```

5. Optional refresh later:

```powershell
npm run token:refresh
```

Token fields are auto-saved into `config.local.json`.

## 4) Dry run first
```powershell
npm run dry-run
```

Check `logs/*.json`.

## 5) Real publish attempt
1. Set `dryRun` to `false` in `config.local.json`
2. Confirm endpoint and payload fields match your approved Douyin scope
3. Run:

```powershell
npm run publish
```

## Notes
- Default is compliance-first dry-run.
- If your account has field limitations, tune `src/lib/publish.js` payload mapping.
- `browser_fallback` flow is intentionally left as next step.
