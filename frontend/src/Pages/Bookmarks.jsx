import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  MapPin,
  Clock,
  ShieldCheck,
  HandHeart,
  Gift,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { getBookmarkedListings, removeBookmark } from "../data/Bookmarksstore";
import "../Css/Bookmarks.css";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "need", label: "Needs" },
  { key: "offer", label: "Offers" },
];

const urgencyLabel = {
  emergency: "Emergency",
  high: "High urgency",
  medium: "Medium urgency",
  low: "Low urgency",
};

export default function Bookmarks() {
  const navigate = useNavigate();
  const [listings, setListings] = useState(getBookmarkedListings());
  const [filter, setFilter] = useState("all");

  const visible = useMemo(() => {
    if (filter === "all") return listings;
    return listings.filter((l) => l.bookmarkType === filter);
  }, [listings, filter]);

  const counts = useMemo(
    () => ({
      all: listings.length,
      need: listings.filter((l) => l.bookmarkType === "need").length,
      offer: listings.filter((l) => l.bookmarkType === "offer").length,
    }),
    [listings]
  );

  const handleUnbookmark = (e, listing) => {
    e.stopPropagation();
    removeBookmark(listing.id, listing.bookmarkType);
    setListings((prev) =>
      prev.filter(
        (l) => !(l.id === listing.id && l.bookmarkType === listing.bookmarkType)
      )
    );
  };

  const handleOpen = (listing) => {
    navigate(`/${listing.bookmarkType === "need" ? "needs" : "offers"}/${listing.id}`);
  };

  return (
    <div className="bm-page">
      <div className="bm-shell">
        <Sidebar tagline="Everything you've saved" hideCreate />

        <main className="bm-main">
          <div className="bm-header">
            <div>
              <h1>Bookmarks</h1>
              <p>Needs and offers you've saved to come back to later.</p>
            </div>
          </div>

          <div className="bm-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`bm-tab ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
                <span className="bm-tab-count">{counts[f.key]}</span>
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="bm-empty">
              <Bookmark size={26} />
              <h3>Nothing bookmarked yet</h3>
              <p>
                {filter === "all"
                  ? "Tap the bookmark icon on any need or offer to save it here."
                  : `You haven't bookmarked any ${filter === "need" ? "needs" : "offers"} yet.`}
              </p>
            </div>
          ) : (
            <div className="bm-grid">
              {visible.map((listing) => {
                const isNeed = listing.bookmarkType === "need";
                return (
                  <article
                    key={`${listing.bookmarkType}-${listing.id}`}
                    className="bm-card"
                    onClick={() => handleOpen(listing)}
                  >
                    <div className="bm-card-top">
                      <span className={`bm-type-chip ${isNeed ? "need" : "offer"}`}>
                        {isNeed ? <HandHeart size={12} /> : <Gift size={12} />}
                        {isNeed ? "Need" : "Offer"}
                      </span>

                      <button
                        type="button"
                        className="bm-save-btn"
                        aria-label="Remove bookmark"
                        onClick={(e) => handleUnbookmark(e, listing)}
                      >
                        <Bookmark size={16} fill="currentColor" />
                      </button>
                    </div>

                    <h3 className="bm-card-title">{listing.title}</h3>
                    <p className="bm-card-desc">{listing.description}</p>

                    <div className="bm-card-meta">
                      <span>
                        <MapPin size={12} />
                        {listing.location}
                        {typeof listing.distance === "number" && listing.distance > 0
                          ? ` · ${listing.distance} km`
                          : ""}
                      </span>
                      <span>
                        <Clock size={12} />
                        {listing.time}
                      </span>
                    </div>

                    <div className="bm-card-tags">
                      {isNeed && listing.urgency && (
                        <span className={`bm-tag urgency-${listing.urgency}`}>
                          {urgencyLabel[listing.urgency] || listing.urgency}
                        </span>
                      )}
                      {!isNeed && listing.condition && listing.condition !== "N/A" && (
                        <span className="bm-tag">{listing.condition}</span>
                      )}
                      {listing.category && <span className="bm-tag">{listing.category}</span>}
                      {(listing.tags || []).slice(0, 2).map((t) => (
                        <span className="bm-tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="bm-card-footer">
                      <div className="bm-avatar">
                        {isNeed ? listing.requesterInitial : listing.ownerInitial}
                      </div>
                      <span className="bm-poster-name">
                        {isNeed ? listing.requesterName : listing.ownerName}
                      </span>
                      {listing.verified && (
                        <span className="bm-verified">
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}