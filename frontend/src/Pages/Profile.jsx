import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Pencil,
  Check,
  X,
  HandHeart,
  Gift,
  Bookmark,
  Calendar,
  Trash2,
  Clock3,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { apiFetch } from "../api";
import "../Css/Profile.css";

const emptyForm = { name: "", bio: "", location: "", email: "", phone: "" };

function formatJoined(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState("needs");
  const [myNeeds, setMyNeeds] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [bookmarksCount, setBookmarksCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [me, needs, offers, bookmarks] = await Promise.all([
          apiFetch("/api/profile"),
          apiFetch("/api/needs/mine"),
          apiFetch("/api/offers/mine"),
          apiFetch("/api/bookmarks"),
        ]);
        setProfile(me);
        setMyNeeds(needs || []);
        setMyOffers(offers || []);
        setBookmarksCount((bookmarks || []).length);
      } catch (err) {
        setError(err.message || "Could not load profile");
      }
    };
    load();
  }, []);

  const startEditing = () => {
    setForm({
      name: profile.name,
      bio: profile.bio || "",
      location: profile.location || "",
      email: profile.email || "",
      phone: profile.phone || "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEditing = async (e) => {
    e.preventDefault();
    try {
      const updated = await apiFetch("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name.trim() || "You",
          bio: form.bio.trim(),
          location: form.location.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim(),
        }),
      });
      setProfile(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.message || "Could not save profile");
    }
  };

  const handleDeleteNeed = async (id) => {
    const confirmed = window.confirm("Delete this need? This can't be undone.");
    if (!confirmed) return;
    try {
      await apiFetch(`/api/needs/${id}`, { method: "DELETE" });
      setMyNeeds((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message || "Could not delete need");
    }
  };

  const handleDeleteOffer = async (id) => {
    const confirmed = window.confirm("Delete this offer? This can't be undone.");
    if (!confirmed) return;
    try {
      await apiFetch(`/api/offers/${id}`, { method: "DELETE" });
      setMyOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      setError(err.message || "Could not delete offer");
    }
  };

  const visibleListings = tab === "needs" ? myNeeds : myOffers;

  if (!profile) {
    return (
      <div className="pf-page">
        <div className="pf-shell">
          <Sidebar tagline="Your NeighborNet profile" hideCreate />
          <main className="pf-main">
            <section className="pf-card pf-header">
              <h1>{error || "Loading profile…"}</h1>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="pf-page">
      <div className="pf-shell">
        <Sidebar tagline="Hyperlocal Community Network" />

        <main className="pf-main">
          {/* Profile header card */}
          <section className="pf-card pf-header">
            {!isEditing ? (
              <>
                <div className="pf-header-top">
                  <div className="pf-avatar-lg">{profile.initial}</div>

                  <div className="pf-header-info">
                    <div className="pf-name-row">
                      <h1>{profile.name}</h1>
                      {profile.verified && (
                        <span className="pf-verified-badge">
                          <ShieldCheck size={13} />
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="pf-bio">{profile.bio}</p>

                    <div className="pf-detail-row">
                      {profile.location && (
                        <span>
                          <MapPin size={13} />
                          {profile.location}
                        </span>
                      )}
                      <span>
                        <Calendar size={13} />
                        Joined {formatJoined(profile.joinedAt)}
                      </span>
                    </div>

                    {(profile.email || profile.phone) && (
                      <div className="pf-detail-row">
                        {profile.email && (
                          <span>
                            <Mail size={13} />
                            {profile.email}
                          </span>
                        )}
                        {profile.phone && (
                          <span>
                            <Phone size={13} />
                            {profile.phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <button type="button" className="pf-edit-btn" onClick={startEditing}>
                    <Pencil size={14} />
                    Edit profile
                  </button>
                </div>
              </>
            ) : (
              <form className="pf-edit-form" onSubmit={saveEditing}>
                <div className="pf-edit-top">
                  <div className="pf-avatar-lg">
                    {(form.name.trim().charAt(0) || "Y").toUpperCase()}
                  </div>
                  <div className="pf-edit-fields">
                    <label className="pf-field">
                      <span>Name</span>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your name"
                        required
                      />
                    </label>

                    <label className="pf-field">
                      <span>Bio</span>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="Tell neighbors a bit about you"
                        rows={2}
                      />
                    </label>

                    <div className="pf-field-grid">
                      <label className="pf-field">
                        <span>Location</span>
                        <input
                          type="text"
                          value={form.location}
                          onChange={(e) => setForm({ ...form, location: e.target.value })}
                          placeholder="Neighborhood, city"
                        />
                      </label>

                      <label className="pf-field">
                        <span>Email</span>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="you@example.com"
                        />
                      </label>

                      <label className="pf-field">
                        <span>Phone</span>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          placeholder="Optional"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pf-edit-actions">
                  <button type="button" className="pf-cancel-btn" onClick={cancelEditing}>
                    <X size={14} />
                    Cancel
                  </button>
                  <button type="submit" className="pf-save-btn">
                    <Check size={14} />
                    Save changes
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Stats */}
          <section className="pf-stats-row">
            <div className="pf-stat-card">
              <HandHeart size={16} />
              <div>
                <div className="pf-stat-value">{myNeeds.length}</div>
                <div className="pf-stat-label">Needs posted</div>
              </div>
            </div>
            <div className="pf-stat-card">
              <Gift size={16} />
              <div>
                <div className="pf-stat-value">{myOffers.length}</div>
                <div className="pf-stat-label">Offers posted</div>
              </div>
            </div>
            <div className="pf-stat-card">
              <Bookmark size={16} />
              <div>
                <div className="pf-stat-value">{bookmarksCount}</div>
                <div className="pf-stat-label">Bookmarks saved</div>
              </div>
            </div>
          </section>

          {/* My listings */}
          <section className="pf-listings">
            <div className="pf-tabs">
              <button
                className={`pf-tab ${tab === "needs" ? "active" : ""}`}
                onClick={() => setTab("needs")}
              >
                <HandHeart size={14} />
                My Needs
                <span className="pf-tab-count">{myNeeds.length}</span>
              </button>
              <button
                className={`pf-tab ${tab === "offers" ? "active" : ""}`}
                onClick={() => setTab("offers")}
              >
                <Gift size={14} />
                My Offers
                <span className="pf-tab-count">{myOffers.length}</span>
              </button>
            </div>

            {visibleListings.length === 0 ? (
              <div className="pf-empty">
                {tab === "needs" ? <HandHeart size={22} /> : <Gift size={22} />}
                <h3>Nothing here yet</h3>
                <p>
                  {tab === "needs"
                    ? "Needs you post will show up here."
                    : "Offers you post will show up here."}
                </p>
                <Link to={tab === "needs" ? "/needs/new" : "/offers/new"} className="pf-empty-btn">
                  {tab === "needs" ? "Post a Need" : "Post an Offer"}
                </Link>
              </div>
            ) : (
              <div className="pf-grid">
                {visibleListings.map((item) => (
                  <article className="pf-listing-card" key={item.id}>
                    <div className="pf-listing-top">
                      <span className={`pf-type-chip ${tab === "needs" ? "need" : "offer"}`}>
                        {tab === "needs" ? <HandHeart size={12} /> : <Gift size={12} />}
                        {tab === "needs" ? "Need" : "Offer"}
                      </span>

                      <button
                        type="button"
                        className="pf-delete-btn"
                        aria-label="Delete listing"
                        onClick={() =>
                          tab === "needs" ? handleDeleteNeed(item.id) : handleDeleteOffer(item.id)
                        }
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h3 className="pf-listing-title">{item.title}</h3>
                    <p className="pf-listing-desc">{item.description}</p>

                    <div className="pf-listing-meta">
                      <span>
                        <MapPin size={12} />
                        {item.location}
                      </span>
                      <span>
                        <Clock3 size={12} />
                        {item.time}
                      </span>
                    </div>

                    <Link
                      to={`/${tab === "needs" ? "needs" : "offers"}/${item.id}`}
                      className="pf-listing-link"
                    >
                      View {tab === "needs" ? "Need" : "Offer"}
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}