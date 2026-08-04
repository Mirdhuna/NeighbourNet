// Simple client-side "backend" for account settings.
// A single editable record persisted to localStorage, following the same
// pattern as Profilestore.js.

const STORAGE_KEY = "neighbornet_settings";

const defaultSettings = {
  name: "Nandha Kumar",
  username: "nandha_k",
  email: "nandha@example.com",
  phone: "+91 98765 43210",
  darkMode: false,
  emailAlerts: true,
  pushAlerts: true,
  smsAlerts: false,
  profilePublic: true,
  language: "English",
  visibility: "Everyone",
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    // fall through to reseed
  }
  save(defaultSettings);
  return defaultSettings;
}

function save(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage unavailable (e.g. private mode) — fail silently
  }
}

/** The current user's settings. */
export function getSettings() {
  return load();
}

/**
 * Merge partial updates into settings (e.g. { darkMode: true }).
 * Returns the updated settings.
 */
export function updateSettings(partial) {
  const current = load();
  const merged = { ...current, ...partial };
  save(merged);
  return merged;
}

/**
 * Wipe all NeighborNet local data (settings, profile, needs, offers,
 * bookmarks, messages). Used by the "Delete Account" action.
 */
export function clearAllData() {
  const keys = [
    "neighbornet_settings",
    "neighbornet_profile",
    "neighbornet_needs",
    "neighbornet_offers",
    "neighbornet_bookmarks",
    "neighbornet_messages",
    "neighbornet_session",
  ];
  try {
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    // localStorage unavailable — nothing to clear
  }
}