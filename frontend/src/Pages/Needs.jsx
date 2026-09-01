import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Clock3,
  Bookmark,
  Plus,
  Grid3X3,
  List,
  AlertCircle,
  X,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { apiFetch } from "../api";
import "../Css/Needs.css";

const categories = ["All", "Medicine", "Transport", "Tools", "Household", "Education"];

export default function Needs() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allNeeds, setAllNeeds] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(() => new Set());

  // Fetch Needs from API (with reliable fallback data)
  useEffect(() => {
    const loadNeeds = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (category !== "All") params.append("category", category);
        if (query.trim()) params.append("q", query.trim());

        const data = await apiFetch(`/api/needs?${params.toString()}`);
        if (Array.isArray(data)) {
          setAllNeeds(data);
        }
      } catch (err) {
        console.error("Failed to load needs:", err);
        // Fallback sample data
        if (allNeeds.length === 0) {
          setAllNeeds([
            {
              id: 1,
              title: "Need a pressure cooker for 2 days",
              description: "Cooking for a family gathering and need a pressure cooker for this weekend.",
              category: "Household",
              urgency: "medium",
              location: "Singanallur",
              distance: "0.8 km",
              requesterName: "Anjali",
              time: "2 hours ago",
            },
            {
              id: 2,
              title: "Urgent medicine pickup from pharmacy",
              description: "Can someone please pick up critical blood pressure medicine from the local pharmacy?",
              category: "Medicine",
              urgency: "emergency",
              location: "Uppilipalayam",
              distance: "1.5 km",
              requesterName: "Ravi",
              time: "20 mins ago",
            },
            {
              id: 3,
              title: "Need ladder for ceiling repair",
              description: "Looking to borrow a 6-foot step ladder for a couple of hours this afternoon.",
              category: "Tools",
              urgency: "low",
              location: "Peelamedu",
              distance: "2.1 km",
              requesterName: "Karthik",
              time: "Yesterday",
            },
            {
              id: 4,
              title: "Emergency transport to clinic",
              description: "Need a quick car ride to the neighborhood clinic for urgent assistance.",
              category: "Transport",
              urgency: "emergency",
              location: "RS Puram",
              distance: "0.5 km",
              requesterName: "Priya",
              time: "10 mins ago",
            },
          ]);
        }
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadNeeds, 250);
    return () => clearTimeout(timer);
  }, [query, category]);

  // Load Bookmarks
  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const rows = await apiFetch("/api/bookmarks");
        if (Array.isArray(rows)) {
          const next = new Set();
          rows.forEach((item) => {
            if (item.bookmarkType === "need" || item.item_type === "need") {
              next.add(item.id || item.item_id);
            }
          });
          setBookmarkedIds(next);
        }
      } catch {
        // Optional
      }
    };
    loadBookmarks();
  }, []);

  // Toggle Bookmark
  const handleToggleBookmark = async (e, needId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiFetch("/api/bookmarks/toggle", {
        method: "POST",
        body: JSON.stringify({ item_id: needId, item_type: "need" }),
      });
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(needId)) next.delete(needId);
        else next.add(needId);
        return next;
      });
    } catch {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (next.has(needId)) next.delete(needId);
        else next.add(needId);
        return next;
      });
    }
  };

  // Filter Needs
  const filteredNeeds = useMemo(() => {
    return allNeeds.filter((item) => {
      const matchCat = category === "All" || item.category?.toLowerCase() === category.toLowerCase();
      const isEmergency = (item.urgency || "").toLowerCase() === "emergency";
      const matchEmergency = !emergencyOnly || isEmergency;
      const matchQuery =
        !query.trim() ||
        item.title?.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase()) ||
        item.location?.toLowerCase().includes(query.toLowerCase());

      return matchCat && matchEmergency && matchQuery;
    });
  }, [allNeeds, category, emergencyOnly, query]);

  return (
    <div className="nn-page">
      <div className="nn-shell">
        {/* Sticky Sidebar pointing to /needs/new */}
        <Sidebar createTo="/needs/new" />

        {/* Main Content Feed */}
        <main className="nn-main">
          {/* Header Bar */}
          <div className="nn-header-card">
            <div>
              <h1 className="nn-page-title">Community Needs</h1>
              <p className="nn-page-subtitle">
                Explore requests from your neighbors and lend a hand.
              </p>
            </div>

            {/* Post a Need button pointing to /needs/new */}
            <Link to="/needs/new" className="nn-create-btn">
              <Plus size={18} />
              <span>Post a Need</span>
            </Link>
          </div>

          {/* Filter and Search Bar */}
          <div className="nn-controls-card">
            {/* Search Input */}
            <div className="nn-search-wrap">
              <Search size={18} className="nn-search-icon" />
              <input
                type="text"
                className="nn-search-input"
                placeholder="Search by keyword, item, or street..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="nn-clear-btn"
                  onClick={() => setQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Pills + Emergency Filter Toggle */}
            <div className="nn-filter-row">
              <div className="nn-category-pills">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`nn-cat-pill ${category === cat ? "active" : ""}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="nn-filter-actions">
                {/* Emergency Quick Filter */}
                <button
                  type="button"
                  className={`nn-emergency-filter-btn ${emergencyOnly ? "active" : ""}`}
                  onClick={() => setEmergencyOnly(!emergencyOnly)}
                >
                  <AlertTriangle size={15} />
                  <span>Emergency Only</span>
                </button>

                {/* Grid / List View Toggle */}
                <div className="nn-view-toggle">
                  <button
                    type="button"
                    className={`nn-view-btn ${viewMode === "grid" ? "active" : ""}`}
                    onClick={() => setViewMode("grid")}
                    aria-label="Grid view"
                  >
                    <Grid3X3 size={17} />
                  </button>
                  <button
                    type="button"
                    className={`nn-view-btn ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <List size={17} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Server Error Alert */}
          {error && (
            <div className="nn-alert-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Needs Cards */}
          {loading ? (
            <div className="nn-loading-state">
              <div className="nn-spinner-ring" />
              <p>Loading community requests...</p>
            </div>
          ) : filteredNeeds.length === 0 ? (
            <div className="nn-empty-card">
              <h3>No needs found</h3>
              <p>Try clearing your search or filters to see more requests.</p>
              <button
                type="button"
                className="nn-reset-filters-btn"
                onClick={() => {
                  setQuery("");
                  setCategory("All");
                  setEmergencyOnly(false);
                }}
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className={`nn-needs-${viewMode}`}>
              {filteredNeeds.map((item) => {
                const isBookmarked = bookmarkedIds.has(item.id);
                const isEmergency = (item.urgency || "").toLowerCase() === "emergency";

                return (
                  <div key={item.id} className={`nn-need-card ${isEmergency ? "is-emergency" : ""}`}>
                    {/* Top Row: Category badge & ONLY Emergency badge if applicable */}
                    <div className="nn-card-top">
                      <div className="nn-badge-group">
                        <span className="nn-cat-badge">
                          {item.category || "General"}
                        </span>
                        
                        {/* ONLY Emergency Label Shown */}
                        {isEmergency && (
                          <span className="nn-emergency-badge">
                            🚨 Emergency
                          </span>
                        )}
                      </div>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        className={`nn-bookmark-action ${isBookmarked ? "active" : ""}`}
                        onClick={(e) => handleToggleBookmark(e, item.id)}
                        title={isBookmarked ? "Remove Bookmark" : "Save Request"}
                      >
                        <Bookmark
                          size={18}
                          fill={isBookmarked ? "#5b87b8" : "none"}
                        />
                      </button>
                    </div>

                    {/* Clean Title & Description */}
                    <div className="nn-card-content">
                      <h3 className="nn-need-title">{item.title}</h3>
                      <p className="nn-need-desc">{item.description}</p>
                    </div>

                    {/* Location & Time Info */}
                    <div className="nn-card-meta">
                      {item.location && (
                        <div className="nn-meta-item">
                          <MapPin size={14} className="nn-meta-icon" />
                          <span>
                            {item.location}
                            {item.distance ? ` (${item.distance})` : ""}
                          </span>
                        </div>
                      )}

                      {item.time && (
                        <div className="nn-meta-item">
                          <Clock3 size={14} className="nn-meta-icon" />
                          <span>{item.time}</span>
                        </div>
                      )}
                    </div>

                    {/* Requester & Action Button */}
                    <div className="nn-card-footer">
                      <div className="nn-requester-info">
                        <div className="nn-avatar">
                          {(item.requesterName || "N")[0].toUpperCase()}
                        </div>
                        <span className="nn-requester-name">
                          {item.requesterName || "Neighbor"}
                        </span>
                      </div>

                      <Link
                        to={`/needs/${item.id}`}
                        className="nn-card-link-btn"
                      >
                        <span>View Details</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}