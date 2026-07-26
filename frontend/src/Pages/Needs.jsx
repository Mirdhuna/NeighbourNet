import React, { useMemo, useState } from "react";
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
import { getAllNeeds } from "../data/Needsstore";
import { isBookmarked, toggleBookmark } from "../data/Bookmarksstore";
import "../Css/Needs.css";

const categories = ["All", "Medicine", "Transport", "Tools", "Household", "Education"];
const urgencies = ["All", "low", "medium", "high", "emergency"];

export default function Needs() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [urgency, setUrgency] = useState("All");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [radius, setRadius] = useState("5");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const allNeeds = getAllNeeds();

  // Which needs are currently bookmarked, keyed by id. Seeded from
  // bookmarksStore on first render, then kept in sync locally on toggle
  // so the icon updates instantly without re-reading localStorage.
  const [bookmarkedIds, setBookmarkedIds] = useState(() => {
    const set = new Set();
    allNeeds.forEach((n) => {
      if (isBookmarked(n.id, "need")) set.add(n.id);
    });
    return set;
  });

  const handleToggleBookmark = (e, need) => {
    e.preventDefault();
    e.stopPropagation();
    const nowBookmarked = toggleBookmark(need.id, "need");
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (nowBookmarked) next.add(need.id);
      else next.delete(need.id);
      return next;
    });
  };

  const filteredNeeds = useMemo(() => {
    let result = [...allNeeds];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.requesterName.toLowerCase().includes(q)
      );
    }

    if (category !== "All") result = result.filter((item) => item.category === category);
    if (urgency !== "All") result = result.filter((item) => item.urgency === urgency);
    if (verifiedOnly) result = result.filter((item) => item.verified);
    result = result.filter((item) => item.distance <= Number(radius));

    if (sortBy === "distance") result.sort((a, b) => a.distance - b.distance);
    else result.sort((a, b) => (a.id < b.id ? 1 : -1));

    return result;
  }, [allNeeds, query, category, urgency, verifiedOnly, radius, sortBy]);

  const stats = {
    total: filteredNeeds.length,
    verified: filteredNeeds.filter((i) => i.verified).length,
    emergency: filteredNeeds.filter((i) => i.urgency === "emergency" || i.urgency === "high").length,
  };

  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setUrgency("All");
    setVerifiedOnly(false);
    setRadius("5");
    setSortBy("latest");
    setError("");
  };

  // Content rendered above the nav in the shared sidebar
  const sidebarTop = (
    <>
      <div className="nn-side-stat">
        <Sparkles size={14} />
        <span>Nearby requests and trusted help</span>
      </div>

      <div className="nn-quick-stats">
        <div className="nn-mini-card">
          <div className="nn-mini-label">Visible</div>
          <div className="nn-mini-value">{stats.total}</div>
        </div>
        <div className="nn-mini-card">
          <div className="nn-mini-label">Verified</div>
          <div className="nn-mini-value">{stats.verified}</div>
        </div>
        <div className="nn-mini-card">
          <div className="nn-mini-label">Priority</div>
          <div className="nn-mini-value">{stats.emergency}</div>
        </div>
      </div>
    </>
  );

  // Content rendered below the nav in the shared sidebar
  const sidebarExtra = (
    <div className="nn-side-box">
      <div className="nn-side-box-title">AI suggestions</div>
      <div className="nn-ai-pill">Recommended matches: 3</div>
      <div className="nn-ai-pill">Suggested categories: Medicine, Transport</div>
      <div className="nn-ai-pill">Urgency prediction: High</div>
    </div>
  );

  return (
    <div className="nn-page">
      <div className="nn-shell">
        <Sidebar
          tagline="Hyperlocal help requests"
          top={sidebarTop}
          extra={sidebarExtra}
          createTo="/needs/new"
        />

        <main className="nn-main">
          <section className="nn-hero">
            <div className="nn-hero-badge">
              <Sparkles size={14} />
              Nearby help requests
            </div>
            <h1>Needs</h1>
            <p>
              Browse local requests for help, lending, pickups, and urgent support around your neighborhood.
            </p>

            <div className="nn-hero-stats">
              <div className="nn-stat-card">
                <span>Users</span>
                <strong>12.4K</strong>
              </div>
              <div className="nn-stat-card">
                <span>Needs Posted</span>
                <strong>3.8K</strong>
              </div>
              <div className="nn-stat-card">
                <span>Matches</span>
                <strong>2.9K</strong>
              </div>
            </div>
          </section>

          <section className="nn-toolbar">
            <div className="nn-search-wrap">
              <Search className="nn-search-icon" size={18} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search needs by title, location, requester..."
                className="nn-search-input"
              />
            </div>

            <div className="nn-toolbar-actions">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="nn-select">
                <option value="latest">Latest</option>
                <option value="distance">Nearest</option>
              </select>

              <button
                className={`nn-view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <Grid3X3 size={16} />
              </button>

              <button
                className={`nn-view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <List size={16} />
              </button>
            </div>
          </section>

          <section className="nn-filters">
            <div className="nn-filter-block">
              <div className="nn-filter-title">
                <Filter size={14} />
                Category
              </div>
              <div className="nn-chip-row">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={`nn-chip ${category === item ? "active" : ""}`}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="nn-filter-block">
              <div className="nn-filter-title">
                <SlidersHorizontal size={14} />
                Urgency
              </div>
              <div className="nn-chip-row">
                {urgencies.map((item) => (
                  <button
                    key={item}
                    className={`nn-chip ${urgency === item ? "active" : ""}`}
                    onClick={() => setUrgency(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="nn-filter-grid">
              <label className="nn-select-box">
                <span>Radius</span>
                <select value={radius} onChange={(e) => setRadius(e.target.value)}>
                  <option value="1">1 km</option>
                  <option value="3">3 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                </select>
              </label>

              <label className="nn-select-box">
                <span>Verified users</span>
                <button
                  type="button"
                  className={`nn-toggle ${verifiedOnly ? "on" : ""}`}
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                >
                  {verifiedOnly ? "Only verified" : "All users"}
                </button>
              </label>

              <button className="nn-clear-btn" onClick={resetFilters}>
                <X size={15} />
                Clear filters
              </button>
            </div>
          </section>

          {loading ? (
            <section className="nn-state-card">
              <div className="nn-spinner" />
              <p>Loading needs...</p>
            </section>
          ) : error ? (
            <section className="nn-state-card error">
              <AlertCircle size={18} />
              <div>
                <strong>Unable to load needs</strong>
                <p>{error}</p>
              </div>
            </section>
          ) : filteredNeeds.length === 0 ? (
            <section className="nn-empty">
              <div className="nn-empty-icon">
                <Search size={24} />
              </div>
              <h3>No needs found</h3>
              <p>Try changing filters, radius, or search terms to see more local requests.</p>
              <button onClick={resetFilters} className="nn-empty-btn">
                Reset Filters
              </button>
            </section>
          ) : (
            <section className={viewMode === "grid" ? "nn-card-grid" : "nn-card-list"}>
              {filteredNeeds.map((need) => {
                const saved = bookmarkedIds.has(need.id);
                return (
                  <article key={need.id} className={`nn-need-card ${viewMode}`}>
                    <div className="nn-need-image">
                      <div className="nn-need-image-inner">Need preview</div>
                    </div>

                    <div className="nn-need-body">
                      <div className="nn-need-top">
                        <div className="nn-badges">
                          <span className="nn-badge category">{need.category}</span>
                          <span className={`nn-badge urgency ${need.urgency}`}>{need.urgency}</span>
                          {need.verified && (
                            <span className="nn-badge verified">
                              <ShieldCheck size={12} />
                              Verified
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className={`nn-bookmark-btn ${saved ? "active" : ""}`}
                          onClick={(e) => handleToggleBookmark(e, need)}
                          aria-label={saved ? "Remove bookmark" : "Save this need"}
                          aria-pressed={saved}
                        >
                          <Bookmark size={18} className="nn-bookmark" fill={saved ? "currentColor" : "none"} />
                        </button>
                      </div>

                      <h3>{need.title}</h3>
                      <p>{need.description}</p>

                      <div className="nn-meta-row">
                        <span><MapPin size={13} /> {need.location} • {need.distance} km</span>
                        <span><Clock3 size={13} /> {need.duration}</span>
                      </div>

                      <div className="nn-tags">
                        {need.tags.map((tag) => (
                          <span key={tag} className="nn-tag">{tag}</span>
                        ))}
                      </div>

                      <div className="nn-need-footer">
                        <div className="nn-owner">
                          <div className="nn-avatar">{need.requesterInitial}</div>
                          <div>
                            <strong>{need.requesterName}</strong>
                            <span>{need.time}</span>
                          </div>
                        </div>

                        <Link to={`/needs/${need.id}`} className="nn-view-more">
                          View Need
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