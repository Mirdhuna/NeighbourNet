
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
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

import Sidebar from "../Components/Sidebar";
import { apiFetch, clearAuthStorage } from "../api";
import { useTheme } from "../context/ThemeContext";
import "../Css/Settings.css";

const defaultSettings = {
  name: "",
  username: "",
  email: "",
  phone: "",
  darkMode: false,
  emailAlerts: true,
  pushAlerts: true,
  smsAlerts: false,
  profilePublic: true,
  language: "English",
  visibility: "Everyone",
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
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/api/settings");

        setSettings({
          ...defaultSettings,
          ...data,
          darkMode: typeof data.darkMode === "boolean" ? data.darkMode : darkMode,
        });

        if (typeof data.darkMode === "boolean") {
          setDarkMode(data.darkMode);
        }

        setForm({
          name: data.name || "",
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        setError(err.message || "Could not load settings");
      }
    };

    load();
  }, []);

  const patch = async (partial) => {
    try {
      setError("");

      const updated = await apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify(partial),
      });

      setSettings({
        ...defaultSettings,
        ...updated,
      });

      if (typeof updated.darkMode === "boolean") {
        setDarkMode(updated.darkMode);
      }
    } catch (err) {
      setError(err.message || "Could not update settings");
    }
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setError("");

      const updated = await apiFetch("/api/settings", {
        method: "PATCH",
        body: JSON.stringify({
          name: form.name,
          username: form.username,
          email: form.email,
          phone: form.phone,
        }),
      });

      setSettings({
        ...defaultSettings,
        ...updated,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (err) {
      setError(err.message || "Could not save settings");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "This will deactivate your account. You will need to contact support to restore it. Continue?"
    );

    if (!confirmed) return;

    try {
      await apiFetch("/api/account/deactivate", {
        method: "POST",
      });
    } catch {
      // Clear the local session even if the API request fails.
    }

    clearAuthStorage();

    navigate("/");
  };

  return (
    <div className="st-page">
      <div className="st-shell">
        <Sidebar tagline="Hyperlocal Community Network" />

        <main className="st-main">
          <section className="st-header">
            <div>
              <div className="st-kicker">Account</div>

              <h1>Settings</h1>

              <p>
                Customize your profile, notifications, privacy, and app
                preferences.
              </p>

              {error && <p>{error}</p>}
            </div>

            <button
              className="st-save-btn"
              type="button"
              onClick={handleSave}
            >
              {saved ? <Check size={16} /> : <Save size={16} />}

              {saved ? "Saved" : "Save Changes"}
            </button>
          </section>

          <section className="st-grid">
            {/* Profile */}
            <div className="st-card st-profile-card">
              <div className="st-card-head">
                <h2>Profile</h2>

                <button
                  className="st-icon-btn"
                  type="button"
                  aria-label="Edit profile"
                >
                  <Edit3 size={16} />
                </button>
              </div>

              <div className="st-profile-top">
                <div className="st-profile-avatar">
                  {(form.name || "N").charAt(0).toUpperCase()}

                  <button
                    className="st-camera-btn"
                    type="button"
                    aria-label="Change profile picture"
                  >
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
                    onChange={(e) =>
                      handleFieldChange("name", e.target.value)
                    }
                  />
                </label>

                <label className="st-field">
                  <span>Username</span>

                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) =>
                      handleFieldChange("username", e.target.value)
                    }
                  />
                </label>

                <label className="st-field">
                  <span>Email</span>

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      handleFieldChange("email", e.target.value)
                    }
                  />
                </label>

                <label className="st-field">
                  <span>Phone</span>

                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      handleFieldChange("phone", e.target.value)
                    }
                  />
                </label>
              </div>
            </div>

            {/* Preferences */}
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
                    className={`st-switch ${
                      darkMode ? "on" : ""
                    }`}
                    onClick={() => {
                      const next = !darkMode;
                      setDarkMode(next);
                      setSettings((prev) => ({ ...prev, darkMode: next }));
                      patch({ darkMode: next });
                    }}
                    type="button"
                    aria-label="Toggle dark mode"
                  >
                    {darkMode ? (
                      <ToggleRight size={22} />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                  </button>
                </div>

                <div className="st-switch-row">
                  <div>
                    <strong>Public Profile</strong>

                    <p>Allow others to view your profile</p>
                  </div>

                  <button
                    className={`st-switch ${
                      settings.profilePublic ? "on" : ""
                    }`}
                    onClick={() =>
                      patch({
                        profilePublic: !settings.profilePublic,
                      })
                    }
                    type="button"
                  >
                    {settings.profilePublic ? (
                      <ToggleRight size={22} />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                  </button>
                </div>

                <label className="st-dropdown">
                  <span>
                    <Globe size={14} />
                    Language
                  </span>

                  <select
                    value={settings.language}
                    onChange={(e) =>
                      patch({
                        language: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      patch({
                        visibility: e.target.value,
                      })
                    }
                  >
                    <option>Everyone</option>
                    <option>Only Friends</option>
                    <option>Only Me</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Notifications */}
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
                    onChange={() =>
                      patch({
                        emailAlerts: !settings.emailAlerts,
                      })
                    }
                  />
                </label>

                <label className="st-check-row">
                  <span>Push Notifications</span>

                  <input
                    type="checkbox"
                    checked={settings.pushAlerts}
                    onChange={() =>
                      patch({
                        pushAlerts: !settings.pushAlerts,
                      })
                    }
                  />
                </label>

                <label className="st-check-row">
                  <span>SMS Alerts</span>

                  <input
                    type="checkbox"
                    checked={settings.smsAlerts}
                    onChange={() =>
                      patch({
                        smsAlerts: !settings.smsAlerts,
                      })
                    }
                  />
                </label>
              </div>
            </div>

            {/* Security */}
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

                  <button
                    className="st-outline-btn"
                    type="button"
                    aria-label="Change password"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="st-security-item">
                  <div>
                    <strong>Privacy</strong>

                    <p>Manage who can see your activity</p>
                  </div>

                  <button
                    className="st-outline-btn"
                    type="button"
                    aria-label="Manage privacy"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                <div className="st-security-item danger">
                  <div>
                    <strong>Delete Account</strong>

                    <p>Permanently delete your account data</p>
                  </div>

                  <button
                    className="st-danger-btn"
                    type="button"
                    onClick={handleDeleteAccount}
                    aria-label="Delete account"
                  >
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
