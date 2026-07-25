// Simple client-side "backend" for messages.
// Conversations + their message threads are persisted to localStorage as a
// single object, seeded on first load so there's always something to show.

const STORAGE_KEY = "neighbornet_messages";

const seedData = {
  conversations: [
    {
      id: "c1",
      name: "Owen R.",
      initial: "O",
      online: true,
      unread: 2,
      updatedAt: Date.now() - 1000 * 60 * 2,
    },
    {
      id: "c2",
      name: "Priya K.",
      initial: "P",
      online: true,
      unread: 0,
      updatedAt: Date.now() - 1000 * 60 * 60,
    },
    {
      id: "c3",
      name: "Alicia M.",
      initial: "A",
      online: false,
      unread: 0,
      updatedAt: Date.now() - 1000 * 60 * 60 * 3,
    },
    {
      id: "c4",
      name: "Derek F.",
      initial: "D",
      online: false,
      unread: 1,
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
  ],
  messages: {
    c1: [
      { id: "m1", from: "them", text: "Hi! Saw your need post — still looking for a pressure cooker Saturday?", time: "10:02 AM" },
      { id: "m2", from: "me", text: "Yes! Anytime after 1pm works great.", time: "10:05 AM" },
      { id: "m3", from: "them", text: "I can bring it by around 3. Should be more than big enough.", time: "10:06 AM" },
      { id: "m4", from: "me", text: "That's perfect, thank you so much 🙏", time: "10:07 AM" },
      { id: "m5", from: "them", text: "Perfect, I'll swing by around 3!", time: "10:08 AM" },
    ],
    c2: [
      { id: "m1", from: "them", text: "Thanks again for walking Biscuit yesterday!", time: "9:14 AM" },
      { id: "m2", from: "me", text: "Anytime, he's such a good boy 🐾", time: "9:20 AM" },
      { id: "m3", from: "them", text: "Biscuit says thank you 🐾", time: "9:21 AM" },
    ],
    c3: [
      { id: "m1", from: "me", text: "Did the stand mixer work out okay?", time: "Mon, 4:02 PM" },
      { id: "m2", from: "them", text: "You're a lifesaver, see you Sat", time: "Mon, 4:10 PM" },
    ],
    c4: [
      { id: "m1", from: "them", text: "Sent an attachment", time: "Yesterday" },
    ],
  },
};

const cannedReplies = [
  "Sounds good, thank you!",
  "Perfect, I'll be there.",
  "Got it — appreciate the quick reply.",
  "That works for me 👍",
  "Thanks, I'll let you know if anything changes.",
];

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to reseed
  }
  save(seedData);
  return seedData;
}

function save(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (e.g. private mode) — fail silently
  }
}

/** Conversations sorted by most recently updated first. */
export function getConversations() {
  const data = load();
  return [...data.conversations].sort((a, b) => b.updatedAt - a.updatedAt);
}

/** Full message thread for one conversation. */
export function getMessages(conversationId) {
  const data = load();
  return data.messages[conversationId] || [];
}

/** Mark a conversation's unread count back to zero. */
export function markRead(conversationId) {
  const data = load();
  const convo = data.conversations.find((c) => c.id === conversationId);
  if (convo) convo.unread = 0;
  save(data);
}

/** Send a message as "me" — appends it and updates the conversation preview. */
export function sendMessage(conversationId, text) {
  const data = load();
  const message = {
    id: `m-${Date.now()}`,
    from: "me",
    text,
    time: "Just now",
  };
  if (!data.messages[conversationId]) data.messages[conversationId] = [];
  data.messages[conversationId].push(message);

  const convo = data.conversations.find((c) => c.id === conversationId);
  if (convo) {
    convo.updatedAt = Date.now();
    convo.unread = 0;
  }
  save(data);
  return message;
}

/** Simulate the other person replying — used for a bit of life in the demo. */
export function receiveAutoReply(conversationId) {
  const data = load();
  const text = cannedReplies[Math.floor(Math.random() * cannedReplies.length)];
  const message = {
    id: `m-${Date.now()}`,
    from: "them",
    text,
    time: "Just now",
  };
  if (!data.messages[conversationId]) data.messages[conversationId] = [];
  data.messages[conversationId].push(message);

  const convo = data.conversations.find((c) => c.id === conversationId);
  if (convo) convo.updatedAt = Date.now();
  save(data);
  return message;
}

/**
 * Start a new conversation with someone by name.
 * If a conversation with that name already exists (case-insensitive match),
 * reuses it instead of creating a duplicate. Returns the conversation id.
 */
export function createConversation(name) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const data = load();
  const existing = data.conversations.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (existing) return existing.id;

  const id = `c-${Date.now()}`;
  const initial = trimmed.charAt(0).toUpperCase();

  data.conversations.push({
    id,
    name: trimmed,
    initial,
    online: false,
    unread: 0,
    updatedAt: Date.now(),
  });
  data.messages[id] = [];

  save(data);
  return id;
}

/** Delete a conversation and its message thread entirely. */
export function deleteConversation(conversationId) {
  const data = load();
  data.conversations = data.conversations.filter((c) => c.id !== conversationId);
  delete data.messages[conversationId];
  save(data);
}