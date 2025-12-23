const BUTTON_ID = "smash-watch-button";
const CHECK_INTERVAL_MS = 1000;

function buildSmashWatchUrl() {
  const url = new URL(window.location.href);
  const segments = url.pathname.split("/").filter(Boolean);
  const tournamentIndex = segments.indexOf("tournament");
  if (tournamentIndex === -1) {
    return `https://smash.watch/?source=${encodeURIComponent(url.href)}`;
  }

  const smashPath = segments.slice(tournamentIndex).join("/");
  return `https://smash.watch/${smashPath}${url.search}`;
}

function shouldShowButton() {
  const { pathname } = window.location;
  return pathname.includes("/tournament/") && pathname.includes("/event/");
}

function upsertButton() {
  const body = document.body;
  if (!body) return;

  const show = shouldShowButton();
  const existing = document.getElementById(BUTTON_ID);

  if (!show) {
    if (existing) existing.remove();
    return;
  }

  const smashWatchUrl = buildSmashWatchUrl();

  if (existing) {
    existing.href = smashWatchUrl;
    return;
  }

  const button = document.createElement("a");
  button.id = BUTTON_ID;
  button.className = "smash-watch-button";
  button.target = "_blank";
  button.rel = "noopener noreferrer";
  button.href = smashWatchUrl;
  button.textContent = "View on smash.watch";

  body.appendChild(button);
}

function setupObservers() {
  let lastUrl = window.location.href;

  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      upsertButton();
    }
  }, CHECK_INTERVAL_MS);

  const observer = new MutationObserver(() => {
    upsertButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function init() {
  upsertButton();
  setupObservers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
