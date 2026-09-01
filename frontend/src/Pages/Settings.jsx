import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Moon,
  Sun,
  Shield,
  Save,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Check,
  LogOut,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { apiFetch, clearAuthStorage } from "../api";
import { useTheme } from "../context/ThemeContext";
import "../Css/Settings.css";

const SETTINGS_KEY = "neighbornet_settings";
const SESSION_KEY = "neighbornet_session";

const defaultSettings = {
  name: "",
  username: "",
  email: "",
  phone: "",
  address: "",
  darkMode: false,
  emailAlerts: true,
  pushAlerts: true,
  emergencyAlerts: true,
};

export default function Settings() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useTheme();

  const [settings, setSettings] = useState(defaultSettings);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    address: "",
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Load Initial Settings & Session
  useEffect(() => {
    const load = async () => {
      try {
        let initialData = { ...defaultSettings };

        // 1. Read from local session
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.user) {
            initialData = { ...initialData, ...parsed.user };
          }
        }

        // 2. Read from local settings
        const savedSettings = localStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          initialData = { ...initialData, ...parsed };
        }

        // 3. Try server settings
        try {
          const data = await apiFetch("/api/settings");
          if (data && typeof data === "object") {
            initialData = { ...initialData, ...data };
          }
        } catch {
          // offline fallback
        }

        setSettings({
          ...initialData,
          darkMode: typeof initialData.darkMode === "boolean" ? initialData.darkMode : darkMode,
        });

        setForm({
          name: initialData.name || "",
          username: initialData.username || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          address: initialData.address || "",
        });
      } catch (err) {
        setError("Loaded settings from local storage.");
      }
    };

    load();
  }, []);

  // Patch single setting (Toggle)
  const patchSetting = async (partial) => {
    try {
      setError("");
      const nextSettings = { ...settings, ...partial };
      setSettings(nextSettings);

      // Persist in localStorage
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));

      // Handle Dark Mode
      if (typeof partial.darkMode === "boolean") {
        setDarkMode(partial.darkMode);
        if (partial.darkMode) {
          document.documentElement.setAttribute("data-theme", "dark");
        } else {
          document.documentElement.removeAttribute("data-theme");
        }
      }

      // Sync with API
      await apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(partial),
      }).catch(() => null);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Saved locally.");
    }
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save profile changes
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setError("");

      const updateData = {
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      // 1. Update local state
      setSettings((prev) => ({ ...prev, ...updateData }));

      // 2. Persist in session
      const existingSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          ...existingSession,
          user: {
            ...(existingSession.user || {}),
            ...updateData,
          },
        })
      );

      // 3. Persist in settings
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ ...settings, ...updateData })
      );

      // 4. Send to backend
      await apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(updateData),
      }).catch(() => null);

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  // Logout
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out?")) {
      clearAuthStorage();
      localStorage.removeItem(SESSION_KEY);
      navigate("/");
    }
  };

  // Clear cache
  const handleClearCache = () => {
    if (window.confirm("Clear locally cached search history and temporary items?")) {
      sessionStorage.clear();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="st-page">
      <div className="st-shell">
        {/* Sticky Sidebar */}
        <Sidebar onLogout={handleLogout} />

        {/* Main Content Area */}
        <main className="st-main">
          {/* Header Banner */}
          <div className="st-hero">
            <div className="st-hero-left">
              <h1 className="st-hero-title">Settings</h1>
              <p className="st-hero-desc">
                Manage your profile, preferences, and community visibility.
              </p>
            </div>

            {saved && (
              <div className="st-toast-saved">
                <Check size={16} />
                <span>Settings saved!</span>
              </div>
            )}

            {error && (
              <div className="st-toast-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Profile Card */}
          <section className="st-card">
            <div className="st-card-title-row">
              <div className="st-card-icon-wrap">
                <User size={18} />
              </div>
              <div>
                <h3 className="st-section-title">Profile Information</h3>
                <p className="st-section-desc">Update your display name, username, and contact information.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="st-form-grid">
              <div className="st-field">
                <label className="st-field-label">Full Name</label>
                <input
                  type="text"
                  className="st-text-input"
                  value={form.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="Your Name"
                />
              </div>

              <div className="st-field">
                <label className="st-field-label">Username</label>
                <div className="st-input-at-wrap">
                  <span className="st-at-sign">@</span>
                  <input
                    type="text"
                    className="st-text-input st-input-with-at"
                    value={form.username}
                    onChange={(e) => handleFieldChange("username", e.target.value)}
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="st-field">
                <label className="st-field-label">Email Address</label>
                <input
                  type="email"
                  className="st-text-input"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="st-field">
                <label className="st-field-label">Phone Number</label>
                <input
                  type="tel"
                  className="st-text-input"
                  value={form.phone}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>

              <div className="st-field st-field-full">
                <label className="st-field-label">Neighborhood / Area</label>
                <input
                  type="text"
                  className="st-text-input"
                  value={form.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                  placeholder="e.g. Singanallur, Coimbatore"
                />
              </div>

              <div className="st-field-full st-btn-row">
                <button
                  type="submit"
                  className="st-btn-save"
                  disabled={saving}
                >
                  <Save size={16} />
                  <span>{saving ? "Saving..." : "Save Profile Changes"}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Notifications Card */}
          <section className="st-card">
            <div className="st-card-title-row">
              <div className="st-card-icon-wrap">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="st-section-title">Notifications & Alerts</h3>
                <p className="st-section-desc">Configure what updates you receive in real-time.</p>
              </div>
            </div>

            <div className="st-toggles-stack">
              {/* Push Alerts */}
              <div className="st-toggle-row">
                <div>
                  <h4 className="st-toggle-label">Push Notifications</h4>
                  <p className="st-toggle-sub">Receive instant alerts when someone responds to your posts.</p>
                </div>
                <button
                  type="button"
                  className="st-toggle-button"
                  onClick={() => patchSetting({ pushAlerts: !settings.pushAlerts })}
                >
                  {settings.pushAlerts ? (
                    <ToggleRight size={32} className="text-blue" />
                  ) : (
                    <ToggleLeft size={32} className="text-muted" />
                  )}
                </button>
              </div>

              {/* Emergency Alerts */}
              <div className="st-toggle-row">
                <div>
                  <h4 className="st-toggle-label">🚨 Emergency Need Alerts</h4>
                  <p className="st-toggle-sub">Get notified when an urgent request is posted in your area.</p>
                </div>
                <button
                  type="button"
                  className="st-toggle-button"
                  onClick={() => patchSetting({ emergencyAlerts: !settings.emergencyAlerts })}
                >
                  {settings.emergencyAlerts ? (
                    <ToggleRight size={32} className="text-blue" />
                  ) : (
                    <ToggleLeft size={32} className="text-muted" />
                  )}
                </button>
              </div>

              {/* Email Alerts */}
              <div className="st-toggle-row">
                <div>
                  <h4 className="st-toggle-label">Email Notifications</h4>
                  <p className="st-toggle-sub">Receive weekly community summaries via email.</p>
                </div>
                <button
                  type="button"
                  className="st-toggle-button"
                  onClick={() => patchSetting({ emailAlerts: !settings.emailAlerts })}
                >
                  {settings.emailAlerts ? (
                    <ToggleRight size={32} className="text-blue" />
                  ) : (
                    <ToggleLeft size={32} className="text-muted" />
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Theme & Appearance */}
          <section className="st-card">
            <div className="st-card-title-row">
              <div className="st-card-icon-wrap">
                {darkMode ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div>
                <h3 className="st-section-title">Appearance</h3>
                <p className="st-section-desc">Toggle between light and dark mode.</p>
              </div>
            </div>

            <div className="st-toggle-row">
              <div>
                <h4 className="st-toggle-label">Dark Mode</h4>
                <p className="st-toggle-sub">Adjust theme for comfortable viewing.</p>
              </div>
              <button
                type="button"
                className="st-toggle-button"
                onClick={() => patchSetting({ darkMode: !darkMode })}
              >
                {darkMode ? (
                  <ToggleRight size={32} className="text-blue" />
                ) : (
                  <ToggleLeft size={32} className="text-muted" />
                )}
              </button>
            </div>
          </section>

          {/* Account Privacy & Actions */}
          <section className="st-card">
            <div className="st-card-title-row">
              <div className="st-card-icon-wrap">
                <Shield size={18} />
              </div>
              <div>
                <h3 className="st-section-title">Account Actions</h3>
                <p className="st-section-desc">Manage session storage and sign out.</p>
              </div>
            </div>

            <div className="st-actions-list">
              <button
                type="button"
                className="st-action-item-btn"
                onClick={handleClearCache}
              >
                <Trash2 size={16} className="text-orange" />
                <span>Clear Local Cache</span>
              </button>

              <button
                type="button"
                className="st-action-item-btn text-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}