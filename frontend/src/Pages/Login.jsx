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
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { API_BASE } from "../api";
import "../Css/Login.css";

function ItemBadge({ icon: Icon, variant, top, left, delay }) {
  return (
    <div
      className={`nn-badge nn-badge--${variant}`}
      style={{ top, left, animationDelay: `${delay}s` }}
    >
      <Icon size={22} strokeWidth={1.75} />
    </div>
  );
}

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

  const validate = () => {
    const next = {};
    if (isRegister) {
      if (!name.trim()) next.name = "Enter your full name.";
      if (!username.trim()) next.username = "Choose a username.";
      else if (username.length < 3) next.username = "Username must be at least 3 characters.";
    }
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "That email doesn't look right.";
    if (!password) next.password = "Enter your password.";
    else if (isRegister && password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAuthSuccess = (data, userEmail, isAdmin = false) => {
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem("access_token", data.access_token);
    storage.setItem(
      "neighbornet_session",
      JSON.stringify({
        email: userEmail,
        user: data.user || data.admin,
        loggedInAt: Date.now(),
      })
    );
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors({});

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

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        let msg = data.detail || (isRegister ? "Registration failed" : "Invalid email or password");
        if (Array.isArray(data.detail)) {
          msg = data.detail.map((d) => d.msg || d.message).join(" ");
        }
        throw new Error(msg);
      }

      handleAuthSuccess(data, email);
    } catch (error) {
      console.error("Auth failed:", error);
      setErrors({
        general: error.message || (isRegister ? "Registration failed. Please try again." : "Login failed. Please try again."),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword, isAdmin = false) => {
    setLoading(true);
    setErrors({});
    setEmail(demoEmail);
    setPassword(demoPassword);
    try {
      const endpoint = isAdmin ? "/api/admin/login" : "/api/auth/login";
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: demoEmail, password: demoPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Demo sign-in failed");
      }
      handleAuthSuccess(data, demoEmail, isAdmin);
    } catch (err) {
      setErrors({ general: err.message || "Demo login failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nn-page">
      <div className="nn-shell">
        {/* Left: illustration / brand panel */}
        <div className="nn-brand-panel">
          <div className="nn-blob-peach" />
          <div className="nn-blob-cream" />

          <div className="nn-logo-row">
            <div className="nn-logo-mark">
              <span>n</span>
            </div>
            <span className="nn-logo-text">NeighbourNet</span>
          </div>

          {/* orbiting item badges around a house */}
          <div className="nn-orbit-wrap">
            <div className="nn-orbit">
              <svg width="260" height="260" viewBox="0 0 260 260" className="nn-orbit-ring">
                <circle
                  cx="130"
                  cy="130"
                  r="95"
                  fill="none"
                  stroke="#33312C"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                  strokeDasharray="4 8"
                />
              </svg>
              <div className="nn-house">
                <span>🏡</span>
              </div>
              <ItemBadge icon={Hammer} variant="peach" top={4} left={90} delay={0} />
              <ItemBadge icon={BookOpen} variant="cream" top={100} left={-4} delay={1.2} />
              <ItemBadge icon={Bike} variant="peach" top={190} left={90} delay={0.6} />
              <ItemBadge icon={Umbrella} variant="cream" top={100} left={186} delay={1.8} />
            </div>
          </div>

          <div className="nn-tagline">
            <h2>Good things happen next door.</h2>
            <p>Borrow the ladder, lend the drill, get to know your street.</p>
          </div>
        </div>

        {/* Right: form panel */}
        <div className="nn-form-panel">
          <div className="nn-mobile-logo">
            <div className="nn-logo-mark nn-logo-mark--sm">
              <span>n</span>
            </div>
            <span className="nn-logo-text nn-logo-text--sm">NeighbourNet</span>
          </div>

          <h1 className="nn-heading">{isRegister ? "Join NeighbourNet" : "Welcome back"}</h1>
          <p className="nn-subheading">
            {isRegister
              ? "Create your neighborhood account in seconds"
              : "Find what you NEED, and OFFER what you can"}
          </p>

          <form className="nn-form" onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <>
                <div>
                  <label htmlFor="name" className="nn-field-label">
                    Full Name
                  </label>
                  <div className="nn-input-wrap">
                    <User size={18} className="nn-input-icon" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Asha Menon"
                      className={`nn-input ${errors.name ? "nn-input--error" : ""}`}
                    />
                  </div>
                  {errors.name && <p className="nn-error-text">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="username" className="nn-field-label">
                    Username
                  </label>
                  <div className="nn-input-wrap">
                    <User size={18} className="nn-input-icon" />
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="asham"
                      className={`nn-input ${errors.username ? "nn-input--error" : ""}`}
                    />
                  </div>
                  {errors.username && <p className="nn-error-text">{errors.username}</p>}
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="nn-field-label">
                Email address
              </label>
              <div className="nn-input-wrap">
                <Mail size={18} className="nn-input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@street.com"
                  className={`nn-input ${errors.email ? "nn-input--error" : ""}`}
                />
              </div>
              {errors.email && <p className="nn-error-text">{errors.email}</p>}
            </div>

            <div>
              <div className="nn-field-row">
                <label htmlFor="password" className="nn-field-label" style={{ marginBottom: 0 }}>
                  Password
                </label>
              </div>
              <div className="nn-input-wrap">
                <Lock size={18} className="nn-input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`nn-input nn-input--with-toggle ${errors.password ? "nn-input--error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="nn-input-toggle"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="nn-error-text">{errors.password}</p>}
            </div>

            {isRegister && (
              <>
                <div>
                  <label htmlFor="phone" className="nn-field-label">
                    Phone (optional)
                  </label>
                  <div className="nn-input-wrap">
                    <Phone size={18} className="nn-input-icon" />
                    <input
                      id="phone"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="nn-input"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="nn-field-label">
                    Neighborhood / City (optional)
                  </label>
                  <div className="nn-input-wrap">
                    <MapPin size={18} className="nn-input-icon" />
                    <input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Coimbatore"
                      className="nn-input"
                    />
                  </div>
                </div>
              </>
            )}

            {!isRegister && (
              <label className="nn-checkbox-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Keep me signed in
              </label>
            )}

            <button type="submit" disabled={loading} className="nn-submit">
              {loading ? (isRegister ? "Creating account…" : "Signing in…") : isRegister ? "Create account" : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
            {errors.general && <p className="nn-error-text">{errors.general}</p>}
          </form>

          <div className="nn-divider-row">
            <div className="nn-divider-line" />
            <span className="nn-divider-text">Quick Demo Sign-In</span>
            <div className="nn-divider-line" />
          </div>

          <div className="nn-oauth-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <button
              type="button"
              className="nn-oauth-btn"
              onClick={() => handleDemoLogin("asha@example.com", "pass123")}
              title="Sign in as Asha Menon"
            >
              <span>👩</span> Asha
            </button>
            <button
              type="button"
              className="nn-oauth-btn"
              onClick={() => handleDemoLogin("ravi@example.com", "pass456")}
              title="Sign in as Ravi Kumar"
            >
              <span>👨</span> Ravi
            </button>
            <button
              type="button"
              className="nn-oauth-btn"
              onClick={() => handleDemoLogin("admin@example.com", "admin123", true)}
              title="Sign in as Admin"
            >
              <span>🛡️</span> Admin
            </button>
          </div>

          <p className="nn-footer-text">
            {isRegister ? "Already have an account?" : "New to the community?"}{" "}
            <button
              type="button"
              className="nn-link"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onClick={() => {
                setIsRegister((prev) => !prev);
                setErrors({});
              }}
            >
              {isRegister ? "Sign in instead" : "Create an account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}