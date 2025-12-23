# Smash Watch Chrome Extension

A minimal content-script extension that injects a `View on smash.watch` button on start.gg tournament event and bracket pages.

## Files
- `manifest.json`: MV3 manifest describing the content script.
- `src/content.js`: Injects and maintains the button, keeping it in sync with SPA navigation.
- `src/content.css`: Styling for the floating button.

## How it works
- Matches start.gg tournament event pages and injects a `View on smash.watch` button.
- It first tries to insert into the page’s nav bar (where “Overview / Brackets / Standings / Matches” live) so it feels native; if that nav can’t be found, it falls back to a floating button.
- The button opens `https://smash.watch/dashboard?view=tournament&tournamentUrl=<current start.gg URL>` so the Dashboard loads in tournament mode with the pasted URL.
- Watches for URL changes and DOM mutations so the button persists across client-side navigation.

## Load locally in Chrome/Brave
1. Open `chrome://extensions/` (or `brave://extensions/`).
2. Toggle **Developer mode** on (top right).
3. Click **Load unpacked** and select `chromium-extension` in this repo.
4. Visit a start.gg event/bracket page; you should see the bottom-right `View on smash.watch` button. It opens smash.watch in a new tab.

## Tweaks
- Update URL logic in `src/content.js` if smash.watch expects a different path/param format.
- Adjust styling in `src/content.css` or change positioning if a floating button is not desired.
