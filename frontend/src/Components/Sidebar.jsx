import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  HandHeart,
  Gift,
  MessageCircle,
  Bookmark,
  User,
  Settings,
  Shield,
  Plus,
  LogOut,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { clearAuthStorage } from "../api";
import { useTheme } from "../context/ThemeContext";
import "../Css/Sidebar.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/needs", label: "Needs", icon: HandHeart },
  { to: "/offers", label: "Offers", icon: Gift },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin", icon: Shield },
];

/**
 * Shared app sidebar across all pages.
 */
export default function Sidebar({
  tagline = "Hyperlocal Community Network",
  top,
  extra,
  createTo,
  hideCreate = false,
  isOpen = false,
  onClose,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isNeedsRoute = location.pathname.startsWith("/needs");
  const isOffersRoute = location.pathname.startsWith("/offers");
  const isNeedsOrOffers = isNeedsRoute || isOffersRoute;

  // The create button is only available in Needs and Offers sections
  const showCreateBtn = !hideCreate && (createTo !== undefined ? true : isNeedsOrOffers);
  const targetCreateTo = createTo || (isOffersRoute ? "/offers/new" : "/needs/new");
  const createLabel = createTo
    ? createTo.includes("offer")
      ? "Create Offer"
      : "Create Need"
    : isOffersRoute
    ? "Create Offer"
    : "Create Need";

  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = () => {
    clearAuthStorage();

    if (onLogout) onLogout();
    else navigate("/");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sb-backdrop" onClick={onClose} />}

      <aside className={`sb-root ${isOpen ? "sb-open" : ""}`}>
        <div className="sb-scroll">
          <div className="sb-top">
            <div className="sb-logo-row">
              <div className="sb-logo-mark">
                <span>N</span>
              </div>
              <div className="sb-logo-info">
                <div className="sb-logo-text">NeighborNet</div>
                {tagline && <div className="sb-tagline">{tagline}</div>}
              </div>
              {onClose && (
                <button
                  type="button"
                  className="sb-close-btn"
                  onClick={onClose}
                  aria-label="Close sidebar"
                >
                  <X size={18} />
                </button>
              )}
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
                  className={({ isActive }) =>
                    `sb-nav-item ${isActive ? "active" : ""}`
                  }
                  onClick={() => {
                    if (onClose) onClose();
                  }}
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
          {showCreateBtn && (
            <button
              type="button"
              className="sb-create-btn"
              onClick={() => {
                if (onClose) onClose();
                navigate(targetCreateTo);
              }}
            >
              <Plus size={16} />
              {createLabel}
            </button>
          )}

          <div className="sb-bottom-row">
            <button
              type="button"
              className="sb-theme-btn"
              onClick={toggleTheme}
              title={`Switch to ${darkMode ? "Light" : "Dark"} Mode`}
              aria-label={`Switch to ${darkMode ? "Light" : "Dark"} Mode`}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <button
              type="button"
              className="sb-logout-btn"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}