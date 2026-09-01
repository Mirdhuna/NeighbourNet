import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Hammer,
  BookOpen,
  Bike,
  Umbrella,
  User,
  Phone,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { API_BASE } from "../api";
import "../Css/Login.css";

export default function NeighbourNetLogin() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const next = {};
    if (isRegister) {
      if (!name.trim()) next.name = "Enter your full name.";
      if (!username.trim()) next.username = "Choose a username.";
      else if (username.length < 3) next.username = "Username must be at least 3 characters.";
    }
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    else if (isRegister && password.length < 6) next.password = "Password must be at least 6 characters.";
    
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAuthSuccess = (data, userEmail, isAdmin = false) => {
    const storage = remember ? window.localStorage : window.sessionStorage;
    if (data?.access_token) {
      storage.setItem("access_token", data.access_token);
    }
    storage.setItem(
      "neighbornet_session",
      JSON.stringify({
        email: userEmail,
        user: data.user || data.admin || { name: name || "Neighbor", email: userEmail },
        loggedInAt: Date.now(),
      })
    );
    if (isAdmin || data?.is_admin) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? {
            name: name.trim(),
            username: username.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            password,
            phone: phone.trim() || undefined,
            address: address.trim() || undefined,
            preferred_radius: 5.0,
          }
        : {
            email: email.trim(),
            password,
          };

      const response = await fetch(`${API_BASE || ""}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let msg = data.detail || (isRegister ? "Registration failed" : "Invalid email or password");
        if (Array.isArray(data.detail)) {
          msg = data.detail.map((d) => d.msg || d.message).join(" ");
        }
        throw new Error(msg);
      }

      handleAuthSuccess(data, email, Boolean(data.admin || data.is_admin));
    } catch (err) {
      setServerError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nn-page">
      <div className="nn-shell">
        {/* Left Side: Extended Illustration Panel */}
        <div className="nn-brand-panel">
          {/* Top Brand Logo */}
          <div className="nn-logo-row">
            <div className="nn-logo-mark">n</div>
            <span className="nn-brand-name">NeighbourNet</span>
          </div>

          {/* Center Orbital Graphic */}
          <div className="nn-orbit-wrapper">
            <div className="nn-orbit-ring" />
            
            {/* Center House Card */}
            <div className="nn-orbit-center">
              <span className="nn-house-emoji">🏡</span>
            </div>

            {/* Orbit Badges */}
            <div className="nn-orbit-badge nn-badge-top">
              <Hammer size={18} />
            </div>
            <div className="nn-orbit-badge nn-badge-right">
              <Umbrella size={18} />
            </div>
            <div className="nn-orbit-badge nn-badge-bottom">
              <Bike size={18} />
            </div>
            <div className="nn-orbit-badge nn-badge-left">
              <BookOpen size={18} />
            </div>
          </div>

          {/* Bottom Headline & Tagline */}
          <div className="nn-hero-text">
            <h3 className="nn-hero-title">
              Good things<br />happen next door.
            </h3>
            <p className="nn-hero-desc">
              Find Happiness in Lending
            </p>
          </div>
        </div>

        {/* Right Side: Centered Form Panel */}
        <div className="nn-form-panel">
          <div className="nn-form-container">
            {/* Header */}
            <div className="nn-form-header">
              <h2 className="nn-form-title">
                {isRegister ? "Create Account" : "Welcome back"}
              </h2>
              <p className="nn-form-subtitle">
                {isRegister
                  ? "Join your neighborhood community network"
                  : "Find what you NEED, and OFFER what you can"}
              </p>
            </div>

            {/* Error banner */}
            {serverError && (
              <div className="nn-alert-error">
                <AlertCircle size={17} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="nn-form" noValidate>
              {isRegister && (
                <>
                  <div className="nn-field">
                    <label className="nn-label">Full Name</label>
                    <div className={`nn-input-box ${errors.name ? "has-error" : ""}`}>
                      <User size={18} className="nn-icon" />
                      <input
                        type="text"
                        className="nn-input"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    {errors.name && <span className="nn-error-text">{errors.name}</span>}
                  </div>

                  <div className="nn-field">
                    <label className="nn-label">Username</label>
                    <div className={`nn-input-box ${errors.username ? "has-error" : ""}`}>
                      <span className="nn-at-symbol">@</span>
                      <input
                        type="text"
                        className="nn-input"
                        placeholder="johndoe"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    {errors.username && <span className="nn-error-text">{errors.username}</span>}
                  </div>
                </>
              )}

              {/* Email Address */}
              <div className="nn-field">
                <label className="nn-label">Email address</label>
                <div className={`nn-input-box ${errors.email ? "has-error" : ""}`}>
                  <Mail size={18} className="nn-icon" />
                  <input
                    type="email"
                    className="nn-input"
                    placeholder="you@street.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <span className="nn-error-text">{errors.email}</span>}
              </div>

              {/* Extra registration details */}
              {isRegister && (
                <div className="nn-row-2">
                  <div className="nn-field">
                    <label className="nn-label">Phone (Optional)</label>
                    <div className="nn-input-box">
                      <Phone size={18} className="nn-icon" />
                      <input
                        type="tel"
                        className="nn-input"
                        placeholder="555-0192"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="nn-field">
                    <label className="nn-label">Address / Area</label>
                    <div className="nn-input-box">
                      <MapPin size={18} className="nn-icon" />
                      <input
                        type="text"
                        className="nn-input"
                        placeholder="Street 4, North Park"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="nn-field">
                <label className="nn-label">Password</label>
                <div className={`nn-input-box ${errors.password ? "has-error" : ""}`}>
                  <Lock size={18} className="nn-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="nn-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={isRegister ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    className="nn-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="nn-error-text">{errors.password}</span>}
              </div>

              {/* Keep me signed in */}
              <div className="nn-checkbox-row">
                <label className="nn-checkbox-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>

              {/* Submit Button */}
              <button type="submit" className="nn-submit-btn" disabled={loading}>
                {loading ? (
                  <span>Please wait...</span>
                ) : (
                  <>
                    <span>{isRegister ? "Register Now" : "Sign in"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="nn-footer">
              <span>
                {isRegister ? "Already have an account?" : "New to the community?"}
              </span>{" "}
              <button
                type="button"
                className="nn-switch-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrors({});
                  setServerError("");
                }}
              >
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}