import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
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
  Plus,
  LogOut,
} from "lucide-react";
import "../Css/Sidebar.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/needs", label: "Needs", icon: HandHeart },
  { to: "/offers", label: "Offers", icon: Gift },
  { to: "/search", label: "Search", icon: Search },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin", icon: Shield },
];

/**
 * Shared app sidebar.
 *
 * Props:
 *  - tagline:   small text under the logo (optional)
 *  - top:       extra content rendered above the nav, e.g. quick stats (optional)
 *  - extra:     extra content rendered below the nav, e.g. an AI suggestions box (optional)
 *  - createTo:  route the "Create Need" button navigates to (default "/needs/new")
 *  - onLogout:  called when Logout is clicked (default: navigate to "/login")
 */
export default function Sidebar({ tagline, top, extra, createTo = "/needs/new", onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    else navigate("/login");
  };

  return (
    <aside className="sb-root">
      <div className="sb-scroll">
        <div className="sb-top">
          <div className="sb-logo-row">
            <div className="sb-logo-mark">
              <span>N</span>
            </div>
            <div>
              <div className="sb-logo-text">NeighborNet</div>
              {tagline && <div className="sb-tagline">{tagline}</div>}
            </div>
          </div>

          {top}
        </div>

        <nav className="sb-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sb-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {extra}
      </div>

      <div className="sb-actions">
        <button
          type="button"
          className="sb-create-btn"
          onClick={() => navigate(createTo)}
        >
          <Plus size={16} />
          Create Need
        </button>

        <button type="button" className="sb-logout-btn" onClick={handleLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}