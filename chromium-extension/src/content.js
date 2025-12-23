const BUTTON_ID = "smash-watch-button";
const CHECK_INTERVAL_MS = 1000;

function buildSmashWatchUrl() {
  const target = new URL("https://smash.watch/dashboard");
  target.searchParams.set("view", "tournament");
  target.searchParams.set("tournamentUrl", window.location.href);
  return target.toString();
}

function shouldShowButton() {
  const { pathname } = window.location;
  return pathname.includes("/tournament/") && pathname.includes("/event/");
}

function findNavContainer() {
  // Start.gg nav uses hashed classnames like "navigation-xxxx". We look for a container that includes known tab labels.
  const candidates = Array.from(document.querySelectorAll('div[class*="navigation-"], nav[role="tablist"], [role="tablist"]'));
  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  };
  return candidates.find((el) => {
    if (!isVisible(el)) return false;
    const text = (el.textContent || "").toLowerCase();
    return text.includes("overview") && text.includes("brackets");
  });
}

function ensureButton(smashWatchUrl) {
  let button = document.getElementById(BUTTON_ID);
  if (!button) {
    button = document.createElement("a");
    button.id = BUTTON_ID;
    button.className = "smash-watch-button smash-watch-floating";
    button.target = "_blank";
    button.rel = "noopener noreferrer";
    button.textContent = "View on smash.watch";
  }
  button.href = smashWatchUrl;
  return button;
}

function placeButton() {
  const body = document.body;
  if (!body) return;

  const show = shouldShowButton();
  const button = document.getElementById(BUTTON_ID);

  if (!show) {
    if (button) button.remove();
    return;
  }

  const smashWatchUrl = buildSmashWatchUrl();
  const btn = ensureButton(smashWatchUrl);
  const nav = findNavContainer();

  if (nav && btn.parentElement !== nav) {
    btn.classList.remove("smash-watch-floating");
    btn.classList.add("smash-watch-nav");
    nav.appendChild(btn);
    return;
  }

  if (!nav && btn.parentElement !== body) {
    btn.classList.add("smash-watch-floating");
    btn.classList.remove("smash-watch-nav");
    body.appendChild(btn);
  }
}

function setupObservers() {
  let lastUrl = window.location.href;

  setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      placeButton();
    }
    // Keep trying in case nav loads late.
    placeButton();
  }, CHECK_INTERVAL_MS);

  const observer = new MutationObserver(() => {
    placeButton();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function init() {
  placeButton();
  setupObservers();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
