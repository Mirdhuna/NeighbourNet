// Simple client-side "backend" for bookmarks.
// Stores only { id, type } references (not full listing data) and joins
// back to the Needs/Offers stores at read time, so bookmarks always show
// current data and never go stale.

import { getAllNeeds } from "./Needsstore";
import { getAllOffers } from "./Offerstore";

const STORAGE_KEY = "neighbornet_bookmarks";

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage unavailable (e.g. private mode) — fail silently
  }
}

/** Raw bookmark refs: [{ id, type }, ...], most recently bookmarked first. */
function getRefs() {
  return load();
}

/** Whether a given listing is currently bookmarked. */
export function isBookmarked(id, type) {
  return getRefs().some((b) => String(b.id) === String(id) && b.type === type);
}

/** Add a bookmark (no-op if already bookmarked). */
export function addBookmark(id, type) {
  if (isBookmarked(id, type)) return;
  const refs = getRefs();
  refs.unshift({ id, type, bookmarkedAt: Date.now() });
  save(refs);
}

/** Remove a bookmark. */
export function removeBookmark(id, type) {
  const refs = getRefs().filter(
    (b) => !(String(b.id) === String(id) && b.type === type)
  );
  save(refs);
}

/** Add if absent, remove if present. Returns the new bookmarked state (bool). */
export function toggleBookmark(id, type) {
  if (isBookmarked(id, type)) {
    removeBookmark(id, type);
    return false;
  }
  addBookmark(id, type);
  return true;
}

/**
 * Full bookmarked listings, joined against the live Needs/Offers stores,
 * each tagged with `bookmarkType` ("need" | "offer") and sorted by most
 * recently bookmarked first. Listings that were since deleted are skipped
 * (and their dangling bookmark ref is cleaned up automatically).
 */
export function getBookmarkedListings() {
  const refs = getRefs();
  const needs = getAllNeeds();
  const offers = getAllOffers();

  const results = [];
  const staleRefs = [];

  for (const ref of refs) {
    if (ref.type === "need") {
      const need = needs.find((n) => String(n.id) === String(ref.id));
      if (need) results.push({ ...need, bookmarkType: "need", bookmarkedAt: ref.bookmarkedAt });
      else staleRefs.push(ref);
    } else if (ref.type === "offer") {
      const offer = offers.find((o) => String(o.id) === String(ref.id));
      if (offer) results.push({ ...offer, bookmarkType: "offer", bookmarkedAt: ref.bookmarkedAt });
      else staleRefs.push(ref);
    }
  }

  if (staleRefs.length) {
    const cleaned = refs.filter((r) => !staleRefs.includes(r));
    save(cleaned);
  }

  return results;
}