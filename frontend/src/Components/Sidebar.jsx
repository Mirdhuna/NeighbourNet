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

export default function Sidebar({
  tagline = "Hyperlocal Community Network",
  createTo,
  hideCreate = false,
  onLogout,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, setDarkMode } = useTheme();

  const isOffersRoute = location.pathname.startsWith("/offers");

  // Navigates to /needs/new or /offers/new
  const createPath = createTo || (isOffersRoute ? "/offers/new" : "/needs/new");
  const createLabel = isOffersRoute ? "+ Create Offer" : "+ Create Need";

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else if (window.confirm("Are you sure you want to log out?")) {
      clearAuthStorage();
      localStorage.removeItem("neighbornet_session");
      navigate("/");
    }
  };

  const handleToggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("neighbornet_theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("neighbornet_theme", "light");
    }
  };

  return (
    <aside className="sb-root">
      {/* Top Section */}
      <div className="sb-top">
        {/* Logo */}
        <div className="sb-logo-row">
          <div className="sb-logo-mark">N</div>
          <div className="sb-logo-info">
            <span className="sb-logo-text">NeighborNet</span>
            <span className="sb-logo-tagline">{tagline}</span>
          </div>
        </div>

        {/* Navigation Links */}
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
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="sb-bottom">
        {/* Create Button */}
        {!hideCreate && (
          <button
            type="button"
            className="sb-create-btn"
            onClick={() => navigate(createPath)}
          >
            <Plus size={17} />
            <span>{createLabel}</span>
          </button>
        )}

        {/* Theme & Logout */}
        <div className="sb-footer-row">
          <button
            type="button"
            className="sb-theme-btn"
            onClick={handleToggleTheme}
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            <span>{darkMode ? "Light" : "Dark"}</span>
          </button>

          <button
            type="button"
            className="sb-logout-btn"
            onClick={handleLogoutClick}
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}