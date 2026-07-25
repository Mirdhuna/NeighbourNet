// Simple client-side "backend" for needs.
// Seed data + anything the user creates via the Create Need form,
// persisted to localStorage so it survives a refresh.

const STORAGE_KEY = "neighbornet_needs";

export const seedNeeds = [
  {
    id: 1,
    title: "Need a pressure cooker for 2 days",
    description:
      "Cooking for a family gathering and need a pressure cooker urgently for this weekend.",
    category: "Household",
    urgency: "medium",
    location: "Singānallūr, Coimbatore",
    distance: 0.8,
    duration: "2 days",
    requesterName: "Anjali",
    requesterInitial: "A",
    verified: true,
    time: "2 hours ago",
    tags: ["Borrow", "Kitchen", "Short-term"],
  },
  {
    id: 2,
    title: "Need medicine pickup",
    description:
      "Can someone pick up blood pressure medicine from the pharmacy nearby?",
    category: "Medicine",
    urgency: "high",
    location: "Uppilipalayam, Coimbatore",
    distance: 1.5,
    duration: "Today",
    requesterName: "Ravi",
    requesterInitial: "R",
    verified: true,
    time: "30 mins ago",
    tags: ["Pickup", "Urgent", "Help"],
  },
  {
    id: 3,
    title: "Need transport for old laptop",
    description: "Need help transporting one laptop and a monitor to my office.",
    category: "Transport",
    urgency: "low",
    location: "Peelamedu, Coimbatore",
    distance: 3.2,
    duration: "This week",
    requesterName: "Karthik",
    requesterInitial: "K",
    verified: false,
    time: "Yesterday",
    tags: ["Transport", "Moving"],
  },
  {
    id: 4,
    title: "Need math tutoring for 10th standard",
    description: "Looking for a nearby tutor for a few sessions this month.",
    category: "Education",
    urgency: "medium",
    location: "Vadavalli, Coimbatore",
    distance: 4.1,
    duration: "1 month",
    requesterName: "Meena",
    requesterInitial: "M",
    verified: true,
    time: "3 hours ago",
    tags: ["Tutor", "Education"],
  },
  {
    id: 5,
    title: "Need drill machine for wall shelf",
    description:
      "Need a drill machine for one small home project. Happy to return the same day.",
    category: "Tools",
    urgency: "low",
    location: "RS Puram, Coimbatore",
    distance: 5.4,
    duration: "1 day",
    requesterName: "Suresh",
    requesterInitial: "S",
    verified: false,
    time: "Today",
    tags: ["Tools", "Home Repair"],
  },
  {
    id: 6,
    title: "Need fruits for an elderly neighbor",
    description: "Requesting fresh fruits and basic items for an elderly person at home.",
    category: "Food",
    urgency: "emergency",
    location: "Gandhipuram, Coimbatore",
    distance: 2.0,
    duration: "Now",
    requesterName: "Priya",
    requesterInitial: "P",
    verified: true,
    time: "Just now",
    tags: ["Emergency", "Food", "Support"],
  },
];

function loadExtra() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveExtra(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // localStorage unavailable (e.g. private mode) — fail silently
  }
}

/** All needs: user-created ones first, then the seed list. */
export function getAllNeeds() {
  return [...loadExtra(), ...seedNeeds];
}

/** Look up a single need by id (string or number). */
export function getNeedById(id) {
  return getAllNeeds().find((n) => String(n.id) === String(id));
}

/**
 * Add a new need created via the Create Need form.
 * Returns the saved need (with its generated id) so the caller
 * can navigate straight to its detail page.
 */
export function addNeed(need) {
  const extra = loadExtra();
  const newNeed = {
    id: `local-${Date.now()}`,
    requesterName: "You",
    requesterInitial: "Y",
    verified: false,
    time: "Just now",
    distance: 0,
    tags: [],
    ...need,
  };
  saveExtra([newNeed, ...extra]);
  return newNeed;
}

/** Remove a user-created need (seed needs can't be deleted). */
export function removeNeed(id) {
  const extra = loadExtra().filter((n) => String(n.id) !== String(id));
  saveExtra(extra);
}