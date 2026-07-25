// Simple client-side "backend" for offers.
// Seed data + anything the user creates via the Create Offer form,
// persisted to localStorage so it survives a refresh.

const STORAGE_KEY = "neighbornet_offers";

export const seedOffers = [
  {
    id: 1,
    title: "Extra tomatoes & basil from the garden",
    description: "Garden went a little wild this year — more tomatoes than one household can eat. Free to a good home.",
    category: "Food",
    condition: "Fresh",
    availability: "This week",
    pickupOption: "Pickup only",
    location: "Singānallūr, Coimbatore",
    distance: 0.4,
    ownerName: "Maya",
    ownerInitial: "M",
    verified: true,
    time: "1 hour ago",
    tags: ["Free", "Kitchen"],
  },
  {
    id: 2,
    title: "Cordless drill, barely used",
    description: "18V cordless drill with two batteries. Available weekends, just return with a full charge.",
    category: "Tools",
    condition: "Like new",
    availability: "Weekends",
    pickupOption: "Can deliver",
    location: "Uppilipalayam, Coimbatore",
    distance: 1.1,
    ownerName: "James",
    ownerInitial: "J",
    verified: true,
    time: "6 hours ago",
    tags: ["Borrow", "Tools"],
  },
  {
    id: 3,
    title: "Free intro guitar lessons",
    description: "Music teacher offering 30-minute intro sessions for beginners, evenings this week.",
    category: "Education",
    condition: "N/A",
    availability: "Evenings",
    pickupOption: "Either",
    location: "Peelamedu, Coimbatore",
    distance: 2.6,
    ownerName: "Ravi",
    ownerInitial: "R",
    verified: false,
    time: "4 hours ago",
    tags: ["Service", "Education"],
  },
  {
    id: 4,
    title: "Pop-up canopy tent for events",
    description: "10x10 canopy, easy setup, great for block parties or yard sales. Pickup only.",
    category: "Household",
    condition: "Good",
    availability: "Anytime",
    pickupOption: "Pickup only",
    location: "Vadavalli, Coimbatore",
    distance: 3.9,
    ownerName: "Grace",
    ownerInitial: "G",
    verified: true,
    time: "1 day ago",
    tags: ["Borrow", "Events"],
  },
  {
    id: 5,
    title: "Kids' bikes, outgrown (ages 5–8)",
    description: "Two bikes our kids outgrew, still in solid shape. First come, first served.",
    category: "Household",
    condition: "Good",
    availability: "This week",
    pickupOption: "Pickup only",
    location: "RS Puram, Coimbatore",
    distance: 4.8,
    ownerName: "Tom",
    ownerInitial: "T",
    verified: true,
    time: "8 hours ago",
    tags: ["Free", "Kids"],
  },
  {
    id: 6,
    title: "Pressure washer, weekend availability",
    description: "Great for driveways and decks. Can drop it off if you're within a couple of km.",
    category: "Tools",
    condition: "Good",
    availability: "Weekends",
    pickupOption: "Can deliver",
    location: "Gandhipuram, Coimbatore",
    distance: 2.2,
    ownerName: "Elena",
    ownerInitial: "E",
    verified: true,
    time: "2 days ago",
    tags: ["Borrow", "Tools"],
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

/** All offers: user-created ones first, then the seed list. */
export function getAllOffers() {
  return [...loadExtra(), ...seedOffers];
}

/** Look up a single offer by id (string or number). */
export function getOfferById(id) {
  return getAllOffers().find((o) => String(o.id) === String(id));
}

/**
 * Add a new offer created via the Create Offer form.
 * Returns the saved offer (with its generated id) so the caller
 * can navigate straight to its detail page.
 */
export function addOffer(offer) {
  const extra = loadExtra();
  const newOffer = {
    id: `local-${Date.now()}`,
    ownerName: "You",
    ownerInitial: "Y",
    verified: false,
    time: "Just now",
    distance: 0,
    tags: [],
    ...offer,
  };
  saveExtra([newOffer, ...extra]);
  return newOffer;
}

/** Remove a user-created offer (seed offers can't be deleted). */
export function removeOffer(id) {
  const extra = loadExtra().filter((o) => String(o.id) !== String(id));
  saveExtra(extra);
}