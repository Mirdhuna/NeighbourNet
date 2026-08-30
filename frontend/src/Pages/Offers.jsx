import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  MapPin,
  Clock3,
  ShieldCheck,
  Bookmark,
  Sparkles,
  SlidersHorizontal,
  Grid3X3,
  List,
  AlertCircle,
  X,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { apiFetch } from "../api";
import "../Css/Offers.css";

const categories = ["All", "Food", "Tools", "Household", "Education", "Equipment"];
const conditions = ["All", "Like new", "Good", "Fair", "Fresh", "N/A"];

export default function Offers() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [radius, setRadius] = useState("5");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allOffers, setAllOffers] = useState([]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        setLoading(true);
        setError("");
        const params = new URLSearchParams({
          category,
          condition,
          verified_only: verifiedOnly,
          radius,
          sort: sortBy,
        });
        if (query.trim()) params.append("q", query.trim());
        const data = await apiFetch(`/api/offers?${params.toString()}`);
        setAllOffers(data);
      } catch (err) {
        setError(err.message || "Could not connect to the server");
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(loadOffers, 300);
    return () => clearTimeout(timer);
  }, [query, category, condition, verifiedOnly, radius, sortBy]);

  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set());

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const rows = await apiFetch("/api/bookmarks");
        const next = new Set();
        rows.forEach((item) => {
          if (item.bookmarkType === "offer") next.add(item.id);
        });
        setBookmarkedIds(next);
      } catch {
        // optional
      }
    };
    loadBookmarks();
  }, [allOffers]);

  const handleToggleBookmark = async (e, offer) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const result = await apiFetch("/api/bookmarks/toggle", {
        method: "POST",
        body: JSON.stringify({ item_id: offer.id, item_type: "offer" }),
      });
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (result.bookmarked) next.add(offer.id);
        else next.delete(offer.id);
        return next;
      });
    } catch (err) {
      setError(err.message || "Could not update bookmark");
    }
  };

  const filteredOffers = useMemo(() => [...allOffers], [allOffers]);

  const stats = {
    total: filteredOffers.length,
    verified: filteredOffers.filter((i) => i.verified).length,
    fresh: filteredOffers.filter((i) => i.condition === "Like new" || i.condition === "Fresh").length,
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setCondition("All");
    setVerifiedOnly(false);
    setRadius("5");
    setSortBy("latest");
    setError("");
  };

  return (
    <div className="of-page">
      <div className="of-shell">
        <Sidebar tagline="Hyperlocal Community Network" />

        <main className="of-main">
          <section className="of-hero">
            <div className="of-hero-badge">
              <Sparkles size={14} />
              Nearby offers
            </div>
            <h1>Offers</h1>
            <p>Browse items to borrow, free finds, and services neighbors are sharing right now.</p>

            <div className="of-hero-stats">
              <div className="of-stat-card">
                <span>Users</span>
                <strong>12.4K</strong>
              </div>
              <div className="of-stat-card">
                <span>Offers Live</span>
                <strong>6.1K</strong>
              </div>
              <div className="of-stat-card">
                <span>Matches</span>
                <strong>2.9K</strong>
              </div>
            </div>
          </section>

          <section className="of-toolbar">
            <div className="of-search-wrap">
              <Search className="of-search-icon" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search offers by title, location, owner..."
                className="of-search-input"
              />
            </div>

            <div className="of-toolbar-actions">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="of-select">
                <option value="latest">Latest</option>
                <option value="distance">Nearest</option>
              </select>

              <button
                className={`of-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>

              <button
                className={`of-view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </section>

          <section className="of-filters">
            <div className="of-filter-block">
              <div className="of-filter-title">
                <Filter size={14} />
                Category
              </div>
              <div className="of-chip-row">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={`of-chip ${category === item ? "active" : ""}`}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="of-filter-block">
              <div className="of-filter-title">
                <SlidersHorizontal size={14} />
                Condition
              </div>
              <div className="of-chip-row">
                {conditions.map((item) => (
                  <button
                    key={item}
                    className={`of-chip ${condition === item ? "active" : ""}`}
                    onClick={() => setCondition(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="of-filter-grid">
              <label className="of-select-box">
                <span>Radius</span>
                <select value={radius} onChange={(e) => setRadius(e.target.value)}>
                  <option value="1">1 km</option>
                  <option value="3">3 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                </select>
              </label>

              <label className="of-select-box">
                <span>Verified users</span>
                <button
                  type="button"
                  className={`of-toggle ${verifiedOnly ? "on" : ""}`}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                >
                  {verifiedOnly ? "Only verified" : "All users"}
                </button>
              </label>

              <button className="of-clear-btn" onClick={resetFilters}>
                <X size={15} />
                Clear filters
              </button>
            </div>
          </section>

          {loading ? (
            <section className="of-state-card">
              <div className="of-spinner" />
              <p>Loading offers...</p>
            </section>
          ) : error ? (
            <section className="of-state-card error">
              <AlertCircle size={18} />
              <div>
                <strong>Unable to load offers</strong>
                <p>{error}</p>
              </div>
            </section>
          ) : filteredOffers.length === 0 ? (
            <section className="of-empty">
              <div className="of-empty-icon">
                <Search size={24} />
              </div>
              <h3>No offers found</h3>
              <p>Try changing filters, radius, or search terms to see more local offers.</p>
              <button onClick={resetFilters} className="of-empty-btn">
                Reset Filters
              </button>
            </section>
          ) : (
            <section className={viewMode === "grid" ? "of-card-grid" : "of-card-list"}>
              {filteredOffers.map((offer) => {
                const saved = bookmarkedIds.has(offer.id);
                return (
                  <article key={offer.id} className={`of-offer-card ${viewMode}`}>
                    <div className="of-offer-image">
                      <div className="of-offer-image-inner">Offer preview</div>
                    </div>

                    <div className="of-offer-body">
                      <div className="of-offer-top">
                        <div className="of-badges">
                          <span className="of-badge category">{offer.category}</span>
                          <span className="of-badge condition">{offer.condition}</span>
                          {offer.verified && (
                            <span className="of-badge verified">
                              <ShieldCheck size={12} />
                              Verified
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`of-bookmark-btn ${saved ? "active" : ""}`}
                          onClick={(e) => handleToggleBookmark(e, offer)}
                          aria-label={saved ? "Remove bookmark" : "Save this offer"}
                          aria-pressed={saved}
                        >
                          <Bookmark size={18} className="of-bookmark" fill={saved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <h3>{offer.title}</h3>
                      <p>{offer.description}</p>

                      <div className="of-meta-row">
                        <span><MapPin size={13} /> {offer.location}{offer.distance != null ? ` • ${offer.distance} km` : ""}</span>
                        <span><Clock3 size={13} /> {offer.availability}</span>
                      </div>

                      <div className="of-tags">
                        {(offer.tags || []).map((tag) => (
                          <span key={tag} className="of-tag">{tag}</span>
                        ))}
                      </div>

                      <div className="of-offer-footer">
                        <div className="of-owner">
                          <div className="of-avatar">{offer.ownerInitial}</div>
                          <div>
                            <strong>{offer.ownerName}</strong>
                            <span>{offer.time}</span>
                          </div>
                        </div>

                        <Link to={`/offers/${offer.id}`} className="of-view-more">
                          View Offer
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}