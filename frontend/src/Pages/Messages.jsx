import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Mic,
  Image as ImageIcon,
  ArrowLeft,
  MessageCircle,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import {
  getConversations,
  getMessages,
  sendMessage,
  markRead,
  receiveAutoReply,
  createConversation,
  deleteConversation,
} from "../data/messagesStore";
import "../Css/Messages.css";


export default function Messages() {
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  const [conversations, setConversations] = useState(getConversations());
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(routeId || conversations[0]?.id || null);
  const [messages, setMessages] = useState(activeId ? getMessages(activeId) : []);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(!!routeId);
  const [showComposer, setShowComposer] = useState(false);
  const [newRecipient, setNewRecipient] = useState("");
  const scrollRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) || null;

  const refreshConversations = () => setConversations(getConversations());

  const openConversation = (id) => {
    setActiveId(id);
    markRead(id);
    setMessages(getMessages(id));
    refreshConversations();
    setMobileShowThread(true);
    setShowComposer(false);
    navigate(`/messages/${id}`, { replace: true });
  };

  useEffect(() => {
    if (routeId && routeId !== activeId) {
      openConversation(routeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeId) return;

    const sent = sendMessage(activeId, text);
    setMessages((prev) => [...prev, sent]);
    setDraft("");
    refreshConversations();

    setTyping(true);
    setTimeout(() => {
      const reply = receiveAutoReply(activeId);
      setMessages((prev) => [...prev, reply]);
      setTyping(false);
      refreshConversations();
    }, 1200 + Math.random() * 800);
  };

  const handleStartConversation = () => {
    const name = newRecipient.trim();
    if (!name) return;

    const id = createConversation(name);
    setNewRecipient("");
    refreshConversations();
    openConversation(id);
  };

  const handleDeleteConversation = (e, convo) => {
    e.stopPropagation(); // don't trigger openConversation on the row

    const confirmed = window.confirm(
      `Delete your conversation with ${convo.name}? This can't be undone.`
    );
    if (!confirmed) return;

    deleteConversation(convo.id);
    const remaining = getConversations();
    setConversations(remaining);

    if (activeId === convo.id) {
      const next = remaining[0]?.id || null;
      setActiveId(next);
      setMessages(next ? getMessages(next) : []);
      if (next) {
        navigate(`/messages/${next}`, { replace: true });
      } else {
        setMobileShowThread(false);
        navigate("/messages", { replace: true });
      }
    }
  };

  return (
    <div className="ms-page">
      <div className="ms-shell">
        <Sidebar tagline="Talk with your neighbors" hideCreate />

        <main className="ms-main">
          <div className={`ms-chat-shell ${mobileShowThread ? "show-thread" : ""}`}>
            <aside className="ms-list">
              <div className="ms-list-top">
                <div className="ms-list-search">
                  <Search size={14} />
                  <input
                    placeholder="Search conversations"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>

                <button
                  className="ms-new-msg-btn"
                  onClick={() => setShowComposer((prev) => !prev)}
                >
                  {showComposer ? <X size={14} /> : <Plus size={14} />}
                  {showComposer ? "Close" : "New Message"}
                </button>
              </div>

              {showComposer && (
                <div className="ms-composer">
                  <input
                    type="text"
                    placeholder="Type recipient name"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleStartConversation();
                      }
                    }}
                    className="ms-composer-input"
                  />
                  <button className="ms-composer-start" onClick={handleStartConversation}>
                    Start Chat
                  </button>
                </div>
              )}

              {filteredConversations.length === 0 ? (
                <div className="ms-list-empty">
                  <MessageCircle size={20} />
                  <p>No conversations match "{query}"</p>
                </div>
              ) : (
                filteredConversations.map((c) => (
                  <div
                    key={c.id}
                    className={`ms-convo ${activeId === c.id ? "active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => openConversation(c.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openConversation(c.id);
                      }
                    }}
                  >
                    <div className="ms-avatar">
                      {c.initial}
                      {c.online && <span className="ms-online-dot" />}
                    </div>

                    <div className="ms-convo-body">
                      <div className="ms-convo-top">
                        <strong>{c.name}</strong>
                        <span className="ms-convo-time">
                          {new Date(c.updatedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p>{getMessages(c.id).slice(-1)[0]?.text || "No messages yet"}</p>
                    </div>

                    {c.unread > 0 && <span className="ms-unread-badge">{c.unread}</span>}

                    <span
                      className="ms-delete-btn"
                      role="button"
                      tabIndex={0}
                      aria-label={`Delete conversation with ${c.name}`}
                      onClick={(e) => handleDeleteConversation(e, c)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleDeleteConversation(e, c);
                        }
                      }}
                    >
                      <Trash2 size={14} />
                    </span>
                  </div>
                ))
              )}
            </aside>

            <section className="ms-thread">
              {!active ? (
                <div className="ms-thread-empty">
                  <MessageCircle size={28} />
                  <p>Select a conversation to start chatting</p>
                </div>
              ) : (
                <>
                  <div className="ms-thread-header">
                    <button className="ms-back-btn" onClick={() => setMobileShowThread(false)}>
                      <ArrowLeft size={16} />
                    </button>

                    <div className="ms-avatar">
                      {active.initial}
                      {active.online && <span className="ms-online-dot" />}
                    </div>

                    <div>
                      <div className="ms-thread-name">{active.name}</div>
                      <div className={`ms-thread-status ${active.online ? "online" : ""}`}>
                        {active.online ? "Online" : "Offline"}
                      </div>
                    </div>
                  </div>

                  <div className="ms-thread-scroll" ref={scrollRef}>
                    {messages.map((m) => (
                      <div key={m.id} className={`ms-bubble-row ${m.from === "me" ? "me" : ""}`}>
                        <div className="ms-bubble">
                          <p>{m.text}</p>
                          <span className="ms-bubble-time">
                            {m.time}
                            {m.from === "me" && " · Sent"}
                          </span>
                        </div>
                      </div>
                    ))}

                    {typing && (
                      <div className="ms-bubble-row">
                        <div className="ms-bubble ms-typing">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    )}
                  </div>

                  <form className="ms-input-row" onSubmit={handleSend}>
                    <button type="button" className="ms-icon-btn">
                      <Smile size={18} />
                    </button>
                    <button type="button" className="ms-icon-btn">
                      <Paperclip size={18} />
                    </button>
                    <button type="button" className="ms-icon-btn">
                      <ImageIcon size={18} />
                    </button>

                    <input
                      className="ms-text-input"
                      placeholder="Type a message..."
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />

                    <button type="button" className="ms-icon-btn">
                      <Mic size={18} />
                    </button>

                    <button type="submit" className="ms-send-btn" disabled={!draft.trim()}>
                      <Send size={15} />
                    </button>
                  </form>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}