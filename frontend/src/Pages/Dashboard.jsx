import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Bookmark,
  MapPin,
  Activity,
  CheckCircle2,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { apiFetch } from "../api";
import "../Css/Dashboard.css";

export default function NeighbourNetDashboard() {
  const [stats, setStats] = useState([
    { label: "Neighbors joined", value: "—", accent: "blue" },
    { label: "Needs posted", value: "—", accent: "green" },
    { label: "Offers created", value: "—", accent: "cyan" },
    { label: "Successful matches", value: "—", accent: "violet" },
  ]);
  const [trustScore, setTrustScore] = useState("—");
  const [completed, setCompleted] = useState("—");
  const [nearbyNeeds, setNearbyNeeds] = useState([]);
  const [myNeeds, setMyNeeds] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [pendingChats, setPendingChats] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [userStats, nearbyN, _nearbyO, mineN, mineO, convos] = await Promise.all([
          apiFetch("/api/dashboard/stats"),
          apiFetch("/api/dashboard/nearby-needs"),
          apiFetch("/api/dashboard/nearby-offers"),
          apiFetch("/api/needs/mine"),
          apiFetch("/api/offers/mine"),
          apiFetch("/api/conversations"),
        ]);
        setTrustScore(userStats.trust_score != null ? `${userStats.trust_score} / 100` : "—");
        setCompleted(userStats.total_completed ?? "—");
        setStats([
          { label: "Your needs", value: String(userStats.total_needs ?? 0), accent: "blue" },
          { label: "Your offers", value: String(userStats.total_offers ?? 0), accent: "green" },
          { label: "Your responses", value: String(userStats.total_responses ?? 0), accent: "cyan" },
          { label: "Completed", value: String(userStats.total_completed ?? 0), accent: "violet" },
        ]);
        setNearbyNeeds(nearbyN || []);
        setMyNeeds((mineN || []).filter((n) => n.status === "active" || !n.status));
        setMyOffers(mineO || []);
        setPendingChats((convos || []).filter((c) => (c.unread || 0) > 0));
      } catch {
        // keep empty dashboard rather than dummy neighbor names
      }
    };
    load();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <Sidebar tagline="Hyperlocal Community Network" />

        {/* Main content */}
        <main className="dashboard-main">
        {/* Top header */}
        <section className="dashboard-header">
          <div className="dashboard-header-left">
            <p className="dashboard-header-label">Dashboard</p>
            <h1 className="dashboard-header-title">
              Welcome back, neighbor!
            </h1>
            <p className="dashboard-header-subtitle">
              View nearby needs, manage your requests and offers, and keep track
              of your trust in the community.
            </p>

            <div className="dashboard-header-pill-row">
              <div className="dashboard-header-pill">
                <Activity className="dashboard-header-pill-icon dashboard-header-pill-icon--trust" size={16} />
                <span>Trust score:</span>
                <span className="dashboard-header-pill-value">{trustScore}</span>
              </div>
              <div className="dashboard-header-pill">
                <CheckCircle2 className="dashboard-header-pill-icon dashboard-header-pill-icon--matches" size={16} />
                <span>Completed requests:</span>
                <span className="dashboard-header-pill-value">{completed}</span>
              </div>
            </div>
          </div>

          {/* Mini stats */}
          <div className="dashboard-header-right">
            {stats.slice(0, 2).map((stat) => (
              <div
                key={stat.label}
                className={`dashboard-stat-card dashboard-stat-card--${stat.accent}`}
              >
                <p className="dashboard-stat-label">{stat.label}</p>
                <p className="dashboard-stat-value">{stat.value}</p>
                <div className="dashboard-stat-bar" />
              </div>
            ))}
          </div>
        </section>

        {/* Full stats grid */}
        <section className="dashboard-stats-grid">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={`dashboard-stat-card dashboard-stat-card--${stat.accent}`}
            >
              <p className="dashboard-stat-label">{stat.label}</p>
              <p className="dashboard-stat-value">{stat.value}</p>
              <div className="dashboard-stat-bar" />
            </div>
          ))}
        </section>

        {/* Nearby needs / My requests / My offers */}
        <section className="dashboard-row">
          {/* Nearby needs */}
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h2 className="dashboard-panel-title">Nearby needs</h2>
                <p className="dashboard-panel-subtitle">
                  Requests posted by neighbors within a few kilometers of you.
                </p>
              </div>
              <MapPin className="dashboard-panel-icon dashboard-panel-icon--blue" size={18} />
            </div>

            <div className="dashboard-panel-list">
              {nearbyNeeds.length === 0 ? (
                <DashboardEmptyState
                  title="No nearby needs"
                  description="When neighbors post requests, they will appear here."
                />
              ) : (
                nearbyNeeds.map((need) => (
                <Link to={`/needs/${need.id}`} key={need.id} className="dashboard-need-card">
                  <div className="dashboard-need-main">
                    <p className="dashboard-need-title">{need.title}</p>
                    <span className={`dashboard-need-badge dashboard-need-badge--${need.urgency}`}>
                      {need.urgency === "emergency"
                        ? "Emergency"
                        : `Urgency: ${need.urgency}`}
                    </span>
                  </div>
                  <p className="dashboard-need-meta">
                    by <span className="dashboard-need-owner">{need.owner}</span>
                    {need.distance != null ? ` • ${need.distance}` : ""} • {need.location}
                  </p>
                </Link>
                ))
              )}
            </div>
          </div>

          {/* My requests */}
          <div className="dashboard-panel">
            <h2 className="dashboard-panel-title">My requests</h2>
            <p className="dashboard-panel-subtitle">
              Needs you’ve posted that are still active or in progress.
            </p>
            {myNeeds.length === 0 ? (
            <DashboardEmptyState
              title="No active requests"
              description="Post a new need to get help from neighbors nearby."
              actionLabel="Create need"
              actionTo="/needs/new"
            />
            ) : (
              <div className="dashboard-panel-list">
                {myNeeds.map((need) => (
                  <Link to={`/needs/${need.id}`} key={need.id} className="dashboard-need-card">
                    <div className="dashboard-need-main">
                      <p className="dashboard-need-title">{need.title}</p>
                    </div>
                    <p className="dashboard-need-meta">{need.location}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My offers */}
          <div className="dashboard-panel">
            <h2 className="dashboard-panel-title">My offers</h2>
            <p className="dashboard-panel-subtitle">
              Items or services you’re currently offering to your community.
            </p>
            {myOffers.length === 0 ? (
              <DashboardEmptyState
                title="No offers yet"
                description="Share an item or skill with neighbors nearby."
                actionLabel="Create offer"
                actionTo="/offers/new"
              />
            ) : (
            <div className="dashboard-panel-list">
              {myOffers.map((offer) => (
                <Link to={`/offers/${offer.id}`} key={offer.id} className="dashboard-offer-card">
                  <div className="dashboard-offer-main">
                    <p className="dashboard-offer-title">{offer.title}</p>
                    <span className="dashboard-offer-badge">
                      {offer.condition || "Offer"}
                    </span>
                  </div>
                  <p className="dashboard-offer-meta">{offer.location}</p>
                </Link>
              ))}
            </div>
            )}
          </div>
        </section>

        {/* Recommended matches & Pending chats */}
        <section className="dashboard-row">
          <div className="dashboard-panel dashboard-panel--wide">
            <div className="dashboard-panel-header">
              <div>
                <h2 className="dashboard-panel-title">Recommended matches</h2>
                <p className="dashboard-panel-subtitle">
                  AI‑powered suggestions based on your needs, offers, location, and trust
                  score.
                </p>
              </div>
              <Sparkles className="dashboard-panel-icon dashboard-panel-icon--green" size={18} />
            </div>
            <DashboardEmptyState
              title="No new recommendations"
              description="Post or update a need/offer and we’ll surface the best local matches."
            />
          </div>

          <div className="dashboard-panel dashboard-panel--wide">
            <div className="dashboard-panel-header">
              <div>
                <h2 className="dashboard-panel-title">Pending chats</h2>
                <p className="dashboard-panel-subtitle">
                  Conversations with neighbors that need your attention.
                </p>
              </div>
              <MessageCircle className="dashboard-panel-icon dashboard-panel-icon--blue" size={18} />
            </div>
            {pendingChats.length === 0 ? (
            <DashboardEmptyState
              title="No pending chats"
              description="Once neighbors respond to your needs or offers, chats will appear here."
            />
            ) : (
              <div className="dashboard-panel-list">
                {pendingChats.map((chat) => (
                  <Link to={`/messages/${chat.id}`} key={chat.id} className="dashboard-offer-card">
                    <div className="dashboard-offer-main">
                      <p className="dashboard-offer-title">{chat.name}</p>
                      <span className="dashboard-offer-badge">{chat.unread} unread</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      </div>
    </div>
  );
}

// Reusable empty state
function DashboardEmptyState({ title, description, actionLabel, actionTo }) {
  return (
    <div className="dashboard-empty">
      <Bookmark className="dashboard-empty-icon" size={20} />
      <h3 className="dashboard-empty-title">{title}</h3>
      <p className="dashboard-empty-text">{description}</p>
      {actionLabel && (
        <Link to={actionTo || "#"} className="dashboard-empty-action">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}