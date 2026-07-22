import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Hammer, BookOpen, Bike, Umbrella } from "lucide-react";
import "../Css/Login.css";
import {FcGoogle} from "react-icons/fc";
import {FaApple} from "react-icons/fa";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "That email doesn't look right.";
    if (!password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => setLoading(false), 1400);
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

          <h1 className="nn-heading">Welcome back</h1>
          <p className="nn-subheading"> Find what you NEED, and OFFER what you can</p>

          <form className="nn-form" onSubmit={handleSubmit} noValidate>
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
                <a href="#" className="nn-link">
                  Forgot password?
                </a>
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

            <label className="nn-checkbox-row">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Keep me signed in
            </label>

            <button type="submit" disabled={loading} className="nn-submit">
              {loading ? "Signing in…" : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="nn-divider-row">
            <div className="nn-divider-line" />
            <span className="nn-divider-text">or continue with</span>
            <div className="nn-divider-line" />
          </div>

          <div className="nn-oauth-grid">
            <button type="button" className="nn-oauth-btn">
              <span><FcGoogle/></span> Google
            </button>
            <button type="button" className="nn-oauth-btn">
              <span><FaApple/></span> Apple
            </button>
          </div>

          <p className="nn-footer-text">
            New to the community?{" "}
            <a href="#" className="nn-link">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}