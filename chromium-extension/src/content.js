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
  // Start.gg nav uses hashed classnames like "navigation-xxxx". We look for a div containing nav links.
  const candidates = Array.from(document.querySelectorAll('div[class*="navigation-"]'));
  return candidates.find((el) => {
    const text = el.textContent?.toLowerCase() ?? "";
    return text.includes("overview") && text.includes("brackets");
  });
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
    const nav = findNavContainer();
    if (nav && existing.parentElement !== nav) {
      existing.classList.remove("smash-watch-floating");
      existing.classList.add("smash-watch-nav");
      nav.appendChild(existing);
    } else if (!nav && existing.parentElement !== body) {
      existing.classList.add("smash-watch-floating");
      existing.classList.remove("smash-watch-nav");
      body.appendChild(existing);
    }
    return;
  }

  const button = document.createElement("a");
  button.id = BUTTON_ID;
  button.className = "smash-watch-button";
  button.classList.add("smash-watch-floating");
  button.target = "_blank";
  button.rel = "noopener noreferrer";
  button.href = smashWatchUrl;
  button.textContent = "View on smash.watch";

  const nav = findNavContainer();
  if (nav) {
    button.classList.remove("smash-watch-floating");
    button.classList.add("smash-watch-nav");
    nav.appendChild(button);
  } else {
    body.appendChild(button);
  }
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
