import {
  LayoutDashboard,
  HandHeart,
  Gift,
  Search,
  MessageCircle,
  Bookmark,
  Bell,
  User,
  Settings,
  Shield,
  MapPin,
  Activity,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import "../Css/Dashboard.css";

export default function NeighbourNetDashboard() {
  // Dummy stats and data – you can later replace with real API data
  const stats = [
    { label: "Neighbors joined", value: "4,210+", accent: "blue" },
    { label: "Needs posted", value: "8,730+", accent: "green" },
    { label: "Offers created", value: "6,120+", accent: "cyan" },
    { label: "Successful matches", value: "5,340+", accent: "violet" },
  ];

  const nearbyNeeds = [
    {
      id: "need-1",
      title: "Borrow a drill for weekend DIY",
      owner: "Priya",
      distance: "1.2 km",
      location: "Udumalaippettai",
      urgency: "medium",
    },
    {
      id: "need-2",
      title: "Emergency ride to hospital",
      owner: "Naveen",
      distance: "2.4 km",
      location: "Udumalaippettai",
      urgency: "emergency",
    },
  ];

  const nearbyOffers = [
    {
      id: "offer-1",
      title: "Laptop repair & setup",
      owner: "Aarav",
      distance: "0.5 km",
      location: "Udumalaippettai",
      type: "Service",
    },
    {
      id: "offer-2",
      title: "Borrow a cycle for evening ride",
      owner: "Karthik",
      distance: "0.9 km",
      location: "Udumalaippettai",
      type: "Item",
    },
  ];

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-header">
          <div className="dashboard-logo-mark">
            <span>n</span>
          </div>
          <div className="dashboard-logo-text">NeighbourNet</div>
        </div>

        <p className="dashboard-sidebar-tagline">
          Helping neighbors, one need at a time.
        </p>

        <nav className="dashboard-sidebar-nav">
          <SidebarItem label="Dashboard" icon={LayoutDashboard} active />
          <SidebarItem label="Needs" icon={HandHeart} />
          <SidebarItem label="Offers" icon={Gift} />
          <SidebarItem label="Search" icon={Search} />
          <SidebarItem label="Messages" icon={MessageCircle} />
          <SidebarItem label="Bookmarks" icon={Bookmark} />
          <SidebarItem label="Notifications" icon={Bell} />
          <SidebarItem label="Profile" icon={User} />
          <SidebarItem label="Settings" icon={Settings} />
          <SidebarItem label="Admin" icon={Shield} />
        </nav>

        <button className="dashboard-sidebar-logout">
          <Settings className="dashboard-sidebar-logout-icon" size={16} />
          <span>Logout</span>
        </button>
      </aside>

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
                <span className="dashboard-header-pill-value">92 / 100</span>
              </div>
              <div className="dashboard-header-pill">
                <CheckCircle2 className="dashboard-header-pill-icon dashboard-header-pill-icon--matches" size={16} />
                <span>Completed requests:</span>
                <span className="dashboard-header-pill-value">42</span>
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
              {nearbyNeeds.map((need) => (
                <div key={need.id} className="dashboard-need-card">
                  <div className="dashboard-need-main">
                    <p className="dashboard-need-title">{need.title}</p>
                    <span className={`dashboard-need-badge dashboard-need-badge--${need.urgency}`}>
                      {need.urgency === "emergency"
                        ? "Emergency"
                        : `Urgency: ${need.urgency}`}
                    </span>
                  </div>
                  <p className="dashboard-need-meta">
                    by <span className="dashboard-need-owner">{need.owner}</span> •{" "}
                    {need.distance} • {need.location}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* My requests */}
          <div className="dashboard-panel">
            <h2 className="dashboard-panel-title">My requests</h2>
            <p className="dashboard-panel-subtitle">
              Needs you’ve posted that are still active or in progress.
            </p>
            <DashboardEmptyState
              title="No active requests"
              description="Post a new need to get help from neighbors nearby."
              actionLabel="Create need"
            />
          </div>

          {/* My offers */}
          <div className="dashboard-panel">
            <h2 className="dashboard-panel-title">My offers</h2>
            <p className="dashboard-panel-subtitle">
              Items or services you’re currently offering to your community.
            </p>
            <div className="dashboard-panel-list">
              {nearbyOffers.map((offer) => (
                <div key={offer.id} className="dashboard-offer-card">
                  <div className="dashboard-offer-main">
                    <p className="dashboard-offer-title">{offer.title}</p>
                    <span className="dashboard-offer-badge">
                      {offer.type}
                    </span>
                  </div>
                  <p className="dashboard-offer-meta">
                    by <span className="dashboard-offer-owner">{offer.owner}</span> •{" "}
                    {offer.distance} • {offer.location}
                  </p>
                </div>
              ))}
            </div>
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
            <DashboardEmptyState
              title="No pending chats"
              description="Once neighbors respond to your needs or offers, chats will appear here."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

// Sidebar navigation item
function SidebarItem({ label, icon: Icon, active }) {
  return (
    <button
      className={`dashboard-sidebar-item ${
        active ? "dashboard-sidebar-item--active" : ""
      }`}
    >
      <Icon className="dashboard-sidebar-item-icon" size={18} />
      <span className="dashboard-sidebar-item-label">{label}</span>
    </button>
  );
}

// Reusable empty state
function DashboardEmptyState({ title, description, actionLabel }) {
  return (
    <div className="dashboard-empty">
      <Bookmark className="dashboard-empty-icon" size={20} />
      <h3 className="dashboard-empty-title">{title}</h3>
      <p className="dashboard-empty-text">{description}</p>
      {actionLabel && (
        <button className="dashboard-empty-action">
          {actionLabel}
        </button>
      )}
    </div>
  );
}