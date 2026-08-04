import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PackageSearch,
  Megaphone,
  MessageCircle,
  BookmarkCheck,
  Bell,
  User,
  Settings as SettingsIcon,
  LogOut,
  Shield,
  Globe,
  Edit3,
  Camera,
  ChevronRight,
  Save,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Check,
} from "lucide-react";
import { getSettings, updateSettings, clearAllData } from "../data/Settingsstore";
import "../Css/Settings.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/needs", label: "Needs", icon: PackageSearch },
  { to: "/offers", label: "Offers", icon: Megaphone },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/bookmarks", label: "Bookmarks", icon: BookmarkCheck },
  //{ to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(getSettings());
  const [form, setForm] = useState({
    name: settings.name,
    username: settings.username,
    email: settings.email,
    phone: settings.phone,
  });
  const [saved, setSaved] = useState(false);

  // Toggles / dropdowns apply immediately.
  const patch = (partial) => {
    const updated = updateSettings(partial);
    setSettings(updated);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updated = updateSettings(form);
    setSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "This will permanently delete your profile, needs, offers, bookmarks, and messages on this device. This can't be undone. Continue?"
    );
    if (!confirmed) return;
    clearAllData();
    navigate("/login");
  };

  return (
    <div className="st-page">
      <div className="st-shell">
        <aside className="st-sidebar">
          <div className="st-sidebar-top">
            <div className="st-logo-row">
              <div className="st-logo-mark">
                <span>N</span>
              </div>
              <div>
                <div className="st-logo-text">NeighborNet</div>
                <div className="st-sidebar-tag">Your account settings</div>
              </div>
            </div>

            <div className="st-user-card">
              <div className="st-user-avatar">{(form.name || "N").charAt(0).toUpperCase()}</div>
              <div>
                <strong>{form.name || "You"}</strong>
                <span>{form.email}</span>
              </div>
            </div>
          </div>

          <nav className="st-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `st-nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="st-side-note">
            <Shield size={16} />
            <span>Manage your account, privacy, and notification preferences.</span>
          </div>

          <button
            className="st-logout-btn"
            onClick={() => {
              try {
                localStorage.removeItem("neighbornet_session");
                sessionStorage.removeItem("neighbornet_session");
              } catch {
                // storage unavailable — still navigate away
              }
              navigate("/login");
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        <main className="st-main">
          <section className="st-header">
            <div>
              <div className="st-kicker">Account</div>
              <h1>Settings</h1>
              <p>Customize your profile, notifications, privacy, and app preferences.</p>
            </div>

            <button className="st-save-btn" onClick={handleSave}>
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </section>

          <section className="st-grid">
            <div className="st-card st-profile-card">
              <div className="st-card-head">
                <h2>Profile</h2>
                <button className="st-icon-btn" type="button">
                  <Edit3 size={16} />
                </button>
              </div>

              <div className="st-profile-top">
                <div className="st-profile-avatar">
                  {(form.name || "N").charAt(0).toUpperCase()}
                  <button className="st-camera-btn" type="button">
                    <Camera size={14} />
                  </button>
                </div>

                <div className="st-profile-meta">
                  <strong>{form.name || "You"}</strong>
                  <span>Active since 2026</span>
                </div>
              </div>

              <div className="st-field-grid">
                <label className="st-field">
                  <span>Full Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                  />
                </label>

                <label className="st-field">
                  <span>Username</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => handleFieldChange("username", e.target.value)}
                  />
                </label>

                <label className="st-field">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                  />
                </label>

                <label className="st-field">
                  <span>Phone</span>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                  />
                </label>
              </div>
            </div>

            <div className="st-card st-pref-card">
              <div className="st-card-head">
                <h2>Preferences</h2>
              </div>

              <div className="st-switch-list">
                <div className="st-switch-row">
                  <div>
                    <strong>Dark Mode</strong>
                    <p>Switch between light and dark appearance</p>
                  </div>
                  <button
                    className={`st-switch ${settings.darkMode ? "on" : ""}`}
                    onClick={() => patch({ darkMode: !settings.darkMode })}
                    type="button"
                  >
                    {settings.darkMode ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>

                <div className="st-switch-row">
                  <div>
                    <strong>Public Profile</strong>
                    <p>Allow others to view your profile</p>
                  </div>
                  <button
                    className={`st-switch ${settings.profilePublic ? "on" : ""}`}
                    onClick={() => patch({ profilePublic: !settings.profilePublic })}
                    type="button"
                  >
                    {settings.profilePublic ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                </div>

                <label className="st-dropdown">
                  <span>
                    <Globe size={14} />
                    Language
                  </span>
                  <select
                    value={settings.language}
                    onChange={(e) => patch({ language: e.target.value })}
                  >
                    <option>English</option>
                    <option>தமிழ்</option>
                    <option>Hindi</option>
                  </select>
                </label>

                <label className="st-dropdown">
                  <span>
                    <User size={14} />
                    Profile Visibility
                  </span>
                  <select
                    value={settings.visibility}
                    onChange={(e) => patch({ visibility: e.target.value })}
                  >
                    <option>Everyone</option>
                    <option>Only Friends</option>
                    <option>Only Me</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="st-card st-notify-card">
              <div className="st-card-head">
                <h2>Notifications</h2>
              </div>

              <div className="st-check-list">
                <label className="st-check-row">
                  <span>Email Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.emailAlerts}
                    onChange={() => patch({ emailAlerts: !settings.emailAlerts })}
                  />
                </label>

                <label className="st-check-row">
                  <span>Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={settings.pushAlerts}
                    onChange={() => patch({ pushAlerts: !settings.pushAlerts })}
                  />
                </label>

                <label className="st-check-row">
                  <span>SMS Alerts</span>
                  <input
                    type="checkbox"
                    checked={settings.smsAlerts}
                    onChange={() => patch({ smsAlerts: !settings.smsAlerts })}
                  />
                </label>
              </div>
            </div>

            <div className="st-card st-security-card">
              <div className="st-card-head">
                <h2>Security</h2>
              </div>

              <div className="st-security-list">
                <div className="st-security-item">
                  <div>
                    <strong>Password</strong>
                    <p>Change your account password</p>
                  </div>
                  <button className="st-outline-btn" type="button">
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="st-security-item">
                  <div>
                    <strong>Privacy</strong>
                    <p>Manage who can see your activity</p>
                  </div>
                  <button className="st-outline-btn" type="button">
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="st-security-item danger">
                  <div>
                    <strong>Delete Account</strong>
                    <p>Permanently delete your account data</p>
                  </div>
                  <button className="st-danger-btn" type="button" onClick={handleDeleteAccount}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}