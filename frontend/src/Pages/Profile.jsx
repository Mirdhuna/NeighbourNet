import React, { useMemo, useState } from "react";
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
import { getProfile, updateProfile } from "../data/Profilestore";
import { getAllNeeds, removeNeed } from "../data/Needsstore";
import { getAllOffers, removeOffer } from "../data/Offerstore";
import { getBookmarkedListings } from "../data/Bookmarksstore";
import "../Css/Profile.css";

const emptyForm = { name: "", bio: "", location: "", email: "", phone: "" };

function formatJoined(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default function Profile() {
  const [profile, setProfile] = useState(getProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [tab, setTab] = useState("needs");

  const [myNeeds, setMyNeeds] = useState(() =>
    getAllNeeds().filter((n) => String(n.id).startsWith("local-"))
  );
  const [myOffers, setMyOffers] = useState(() =>
    getAllOffers().filter((o) => String(o.id).startsWith("local-"))
  );

  const bookmarksCount = useMemo(() => getBookmarkedListings().length, []);

  const startEditing = () => {
    setForm({
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      email: profile.email,
      phone: profile.phone,
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEditing = (e) => {
    e.preventDefault();
    const updated = updateProfile({
      name: form.name.trim() || "You",
      bio: form.bio.trim(),
      location: form.location.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setProfile(updated);
    setIsEditing(false);
  };

  const handleDeleteNeed = (id) => {
    const confirmed = window.confirm("Delete this need? This can't be undone.");
    if (!confirmed) return;
    removeNeed(id);
    setMyNeeds((prev) => prev.filter((n) => n.id !== id));
  };

  const handleDeleteOffer = (id) => {
    const confirmed = window.confirm("Delete this offer? This can't be undone.");
    if (!confirmed) return;
    removeOffer(id);
    setMyOffers((prev) => prev.filter((o) => o.id !== id));
  };

  const visibleListings = tab === "needs" ? myNeeds : myOffers;

  return (
    <div className="pf-page">
      <div className="pf-shell">
        <Sidebar tagline="Your NeighborNet profile" hideCreate />

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