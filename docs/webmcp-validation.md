# WebMCP Validation (Chrome Canary)

This project exposes WebMCP tools on:

- `/dashboard`: `getRegionStats`, `listTournamentSeries`, `getTournamentSeriesStats`, `searchTournament`, `getAvailableRegions`
- `/`: `getSiteCapabilities`

In development builds, a helper is exposed at `window.webmcpDebug`.

## Quick verification

1. Open `http://localhost:3000/dashboard` in Chrome Canary with WebMCP flags enabled.
2. In DevTools Console run:

```js
await window.webmcpDebug.run()
```

Expected:

- `checks.secureContext === true`
- `checks.modelContextType === "object"`
- `checks.modelContextTestingType === "object"`
- `missingTools` is empty
- `calls.getAvailableRegions` returns `{ regions: [...] }`

3. On `/` run:

```js
await window.webmcpDebug.run()
```

Expected:

- `missingTools` is empty
- `calls.getSiteCapabilities.tools_available_at === "/dashboard"`

## Manual probes

```js
window.isSecureContext
typeof navigator.modelContext
typeof navigator.modelContext.registerTool
typeof navigator.modelContextTesting
await window.webmcpDebug.getTools()
await window.webmcpDebug.runDashboardChecks()
await window.webmcpDebug.runRootChecks()
```
