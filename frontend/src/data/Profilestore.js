// Simple client-side "backend" for the user's own profile.
// A single editable record persisted to localStorage.

const STORAGE_KEY = "neighbornet_profile";

const defaultProfile = {
  name: "You",
  initial: "Y",
  bio: "Add a short bio so neighbors know a bit about you.",
  location: "",
  email: "",
  phone: "",
  verified: false,
  joinedAt: Date.now(),
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
  } catch {
    // fall through to reseed
  }
  save(defaultProfile);
  return defaultProfile;
}

function save(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage unavailable (e.g. private mode) — fail silently
  }
}

/** The current user's profile. */
export function getProfile() {
  return load();
}

/**
 * Merge partial updates into the profile (e.g. { name, bio, location }).
 * Keeps `initial` in sync with `name` automatically unless one is passed explicitly.
 * Returns the updated profile.
 */
export function updateProfile(partial) {
  const current = load();
  const merged = { ...current, ...partial };

  if (partial.name && !partial.initial) {
    merged.initial = partial.name.trim().charAt(0).toUpperCase() || "Y";
  }

  save(merged);
  return merged;
}