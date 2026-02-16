# WebMCP Overview (smash.watch)

## What this layer does

smash.watch exposes structured analytics tools to browser agents via WebMCP (`navigator.modelContext`).

- On `/dashboard`, the site registers 5 read-only analytics tools plus 1 UI action tool.
- On `/`, the site registers a discovery tool (`getSiteCapabilities`) that tells agents to navigate to `/dashboard` for full analytics capabilities.

This is additive-only: if WebMCP is unavailable, the normal website behavior is unchanged.

## Tools exposed

- `getRegionStats`: state-level player performance scatter/table data.
- `listTournamentSeries`: available recurring series in a state.
- `getTournamentSeriesStats`: player stats for a selected series key.
- `searchTournament`: stats lookup by start.gg URL/slug.
- `getAvailableRegions`: supported US state/region codes.
- `renderRegionDashboard`: UI action tool that applies state filters and triggers dashboard rendering on `/dashboard`.
- `getSiteCapabilities` (root discovery): describes available tools and points to `/dashboard`.

Implementation references:

- `lib/webmcp.ts`
- `lib/webmcp-navigation.ts`

## What we had to do to make it actually work

Defining tool objects was not enough. Reliable exposure required runtime lifecycle handling:

1. Feature detection before registration (`navigator.modelContext`).
2. Registration on page mount.
3. Unregistration on cleanup/unmount.
4. Short retry window for registration because WebMCP availability can lag initial render in Canary.
5. Dev diagnostics helper (`window.webmcpDebug`) for runtime verification.
6. Dev spy fallback to track register/unregister calls when Canary exposes `modelContextTesting` without `getTools`/`callTool`.

This is why “tools defined in code” and “tools actually exposed to the browser agent” are separate checks.

Diagnostics references:

- `lib/webmcp-diagnostics.ts`
- `docs/webmcp-validation.md`

## How we proved it works (today’s results)

Validated on Chrome Canary 147 with WebMCP testing enabled at `http://localhost:3000`.

### Root (`/`)

- `registeredTools` included `getSiteCapabilities`.
- `missingTools` was empty.
- Spy state showed:
  - `installed: true`
  - `registerCalls: 1`
  - `trackedTools: ["getSiteCapabilities"]`

### Dashboard (`/dashboard`)

- `registeredTools` included all 6 dashboard tools.
- `missingTools` was empty.
- Spy state showed:
  - `installed: true`
  - `registerCalls: 6`
  - `trackedTools` contained the 6 expected tool names.

## Tool classes and event bridge

- Read-only tools (`getRegionStats`, `listTournamentSeries`, `getTournamentSeriesStats`, `searchTournament`, `getAvailableRegions`) return JSON only.
- UI action tool (`renderRegionDashboard`) dispatches a browser event and returns an acknowledgement envelope.

Event contract:

- Event name: `smash:webmcp:render`
- Payload shape:
  - `target: "dashboard"`
  - `mode: "state" | "tournament"`
  - `filters: {...}`
  - `requestId: string`
  - `source: "webmcp-tool"`

Current implementation listens for `mode: "state"` on `/dashboard`, maps payload fields into dashboard filter state, and executes the same state query path as manual Apply.

Verification commands used:

```js
await window.webmcpDebug.run()
window.webmcpDebug.getSpyState()
```

## What AI can use now vs later

As of **February 16, 2026**, WebMCP is in early Chrome preview/testing surfaces (Chrome developer preview announcement date: **February 10, 2026**).

Practical interpretation:

- Useful now for readiness, demos, and early compatibility work.
- Production agent consumption is still limited.
- Broad, reliable cross-agent usage is more likely in the coming months than in the next couple of weeks.

Avoid promising a fixed stable rollout date; treat this as forward-compatible groundwork.

## Do we need extra explainers/comments?

Short answer: yes, but targeted.

- Tool metadata already acts as machine-readable explanation (`name`, `description`, `inputSchema`).
- Keep short human docs like this for engineers/PMs.
- Add code comments only where behavior is non-obvious:
  - registration retry logic,
  - diagnostics/spy fallback behavior.
- Avoid comment noise in straightforward tool definitions.

## Acceptance checklist

- A new engineer can explain what WebMCP does here in under one minute.
- The docs clearly separate “defined tools” vs “runtime-exposed tools.”
- Root and dashboard validation outcomes are recorded with concrete evidence.
- Adoption guidance is conservative and date-grounded.
