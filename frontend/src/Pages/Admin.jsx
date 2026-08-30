import { useEffect, useMemo, useState } from "react";
import {
  Menu,
  Search,
  Users,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CircleDollarSign,
  Plus,
  Filter,
  MoreVertical,
  Trash2,
  UserX,
  Lock,
  ArrowRight,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { apiFetch, getAccessToken } from "../api";
import "../Css/Admin.css";

export default function Admin() {
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [range, setRange] = useState("7d");
  const [stats, setStats] = useState({
    total_users: 0,
    active_needs: 0,
    active_offers: 0,
    total_completed: 0,
    resolved_today: 0,
    pending_responses: 0,
    verified_users: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminAuthRequired, setAdminAuthRequired] = useState(false);
  const [adminEmail, setAdminEmail] = useState("admin@example.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError("");
      setAdminAuthRequired(false);

      const [statsData, activityData] = await Promise.all([
        apiFetch("/api/admin/stats"),
        apiFetch("/api/admin/activity?limit=30"),
      ]);

      setStats(statsData);
      setActivities(activityData || []);
    } catch (err) {
      if (err.status === 401 || err.status === 403 || (err.message && err.message.includes("Admin token required"))) {
        setAdminAuthRequired(true);
      } else {
        setError(err.message || "Could not load admin data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Admin authentication failed");
      }
      localStorage.setItem("access_token", data.access_token);
      setAdminAuthRequired(false);
      loadAdminData();
    } catch (err) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRemovePost = async (postType, postId) => {
    const confirmed = window.confirm(`Remove this ${postType} #${postId}?`);
    if (!confirmed) return;
    try {
      await apiFetch(`/api/admin/posts/${postType}/${postId}/remove`, { method: "POST" });
      alert("Post removed.");
      loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to remove post");
    }
  };

  const handleDeactivateUser = async (userId) => {
    const confirmed = window.confirm(`Deactivate user #${userId}?`);
    if (!confirmed) return;
    try {
      await apiFetch(`/api/admin/users/${userId}/deactivate`, { method: "POST" });
      alert("User deactivated.");
      loadAdminData();
    } catch (err) {
      alert(err.message || "Failed to deactivate user");
    }
  };

  const statCards = [
    {
      label: "Total Users",
      value: String(stats.total_users || 0),
      change: `${stats.verified_users || 0} verified`,
      icon: Users,
      tone: "blue",
    },
    {
      label: "Active Needs",
      value: String(stats.active_needs || 0),
      change: "Active community needs",
      icon: FileText,
      tone: "peach",
    },
    {
      label: "Active Offers",
      value: String(stats.active_offers || 0),
      change: "Available to neighbors",
      icon: ShieldCheck,
      tone: "green",
    },
    {
      label: "Resolved",
      value: String(stats.total_completed || 0),
      change: `${stats.resolved_today || 0} today`,
      icon: CheckCircle2,
      tone: "yellow",
    },
  ];

  const filteredActivities = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter(
      (a) =>
        (a.actor_name || "").toLowerCase().includes(q) ||
        (a.action_type || "").toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q) ||
        (a.target_type || "").toLowerCase().includes(q)
    );
  }, [activities, query]);

  return (
    <div className="ad-page">
      <div className="ad-shell">
        <Sidebar
          tagline="Hyperlocal Community Network"
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />

        <main className="ad-main">
          <header className="ad-topbar">
            <div className="ad-top-left">
              <button className="ad-menu-btn" onClick={() => setMobileNavOpen(true)}>
                <Menu size={20} />
              </button>

              <div>
                <div className="ad-kicker">Admin Console</div>
                <h1>Platform Management</h1>
              </div>
            </div>

            <div className="ad-top-actions">
              <div className="ad-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search activity, users..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <select className="ad-range" value={range} onChange={(e) => setRange(e.target.value)}>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
              </select>
            </div>
          </header>

          {adminAuthRequired ? (
            <div className="ad-panel" style={{ maxWidth: 460, margin: "2rem auto", padding: "2rem" }}>
              <div className="ad-panel-head" style={{ marginBottom: "1.5rem" }}>
                <div>
                  <h2>Admin Authentication Required</h2>
                  <p>Please log in with an administrator account to access platform metrics.</p>
                </div>
              </div>

              <form onSubmit={handleAdminLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--ad-line, #ccc)" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "13px", fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--ad-line, #ccc)" }}
                  />
                </div>

                {loginError && <p style={{ color: "#e53e3e", fontSize: "13px" }}>{loginError}</p>}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="ad-panel-btn"
                  style={{ justifyContent: "center", marginTop: "0.5rem" }}
                >
                  <Lock size={15} />
                  {loginLoading ? "Authenticating…" : "Sign In to Admin Console"}
                </button>
              </form>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ background: "rgba(239, 68, 68, 0.15)", color: "#fca5a5", padding: "12px 16px", borderRadius: 12, marginBottom: "1rem" }}>
                  {error}
                </div>
              )}

              <section className="ad-stats-grid">
                {statCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.label} className={`ad-stat-card ${item.tone}`}>
                      <div className="ad-stat-top">
                        <div className="ad-stat-icon">
                          <Icon size={18} />
                        </div>
                        <span className="ad-stat-change">{item.change}</span>
                      </div>
                      <div className="ad-stat-label">{item.label}</div>
                      <div className="ad-stat-value">{item.value}</div>
                    </article>
                  );
                })}
              </section>

              <section className="ad-content-grid">
                <div className="ad-panel ad-chart-panel">
                  <div className="ad-panel-head">
                    <div>
                      <h2>Platform Balance</h2>
                      <p>Active community supply & demand</p>
                    </div>
                  </div>

                  <div className="ad-chart-box">
                    <div className="ad-chart-bars">
                      <span style={{ height: `${Math.min(100, (stats.active_needs || 1) * 20)}%` }} />
                      <span style={{ height: `${Math.min(100, (stats.active_offers || 1) * 20)}%` }} />
                      <span style={{ height: `${Math.min(100, (stats.total_users || 1) * 25)}%` }} />
                      <span style={{ height: `${Math.min(100, (stats.total_completed || 1) * 30)}%` }} />
                    </div>

                    <div className="ad-chart-legend">
                      <div><span className="dot blue" /> Needs ({stats.active_needs})</div>
                      <div><span className="dot peach" /> Offers ({stats.active_offers})</div>
                      <div><span className="dot green" /> Users ({stats.total_users})</div>
                    </div>
                  </div>
                </div>

                <div className="ad-panel ad-alert-panel">
                  <div className="ad-panel-head">
                    <div>
                      <h2>System Status</h2>
                      <p>Platform health & queues</p>
                    </div>
                  </div>

                  <div className="ad-alert-list">
                    <div className="ad-alert-item">
                      <CheckCircle2 size={16} color="#4ade80" />
                      <span>PostgreSQL Database: Online & Healthy</span>
                    </div>
                    <div className="ad-alert-item">
                      <ShieldCheck size={16} color="#60a5fa" />
                      <span>{stats.verified_users} verified community members</span>
                    </div>
                    <div className="ad-alert-item">
                      <Clock3 size={16} color="#fbbf24" />
                      <span>{stats.pending_responses || 0} responses in progress</span>
                    </div>
                  </div>
                </div>

                <div className="ad-panel ad-table-panel">
                  <div className="ad-panel-head">
                    <div>
                      <h2>Recent Platform Activity</h2>
                      <p>Real-time log of needs, offers, reviews, and registrations</p>
                    </div>
                    <button className="ad-panel-btn secondary" onClick={loadAdminData}>
                      Refresh
                    </button>
                  </div>

                  <div className="ad-table-wrap">
                    {filteredActivities.length === 0 ? (
                      <div style={{ padding: "2rem", textAlign: "center", color: "var(--ad-soft, #888)" }}>
                        No activities logged yet.
                      </div>
                    ) : (
                      <table className="ad-table">
                        <thead>
                          <tr>
                            <th>Actor</th>
                            <th>Action</th>
                            <th>Details</th>
                            <th>Target</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredActivities.map((row) => (
                            <tr key={row.history_id || `${row.actor_name}-${row.created_date}`}>
                              <td><strong>{row.actor_name || "System"}</strong></td>
                              <td>
                                <span className={`ad-pill ${String(row.action_type || "").toLowerCase().includes("need") ? "approved" : "verified"}`}>
                                  {row.action_type}
                                </span>
                              </td>
                              <td>{row.description}</td>
                              <td>{row.target_type || "—"} #{row.target_id || ""}</td>
                              <td style={{ whiteSpace: "nowrap", fontSize: "12px" }}>
                                {row.created_date ? new Date(row.created_date).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="ad-panel ad-quick-panel">
                  <div className="ad-panel-head">
                    <div>
                      <h2>Quick Actions</h2>
                      <p>Administrative shortcuts</p>
                    </div>
                  </div>

                  <div className="ad-quick-list">
                    <button
                      className="ad-quick-btn"
                      onClick={() => {
                        const target = prompt("Enter Need or Offer ID to remove (e.g. need 1):");
                        if (!target) return;
                        const [type, id] = target.trim().split(" ");
                        if (type && id) handleRemovePost(type, Number(id));
                      }}
                    >
                      <Trash2 size={16} />
                      Remove Post
                    </button>
                    <button
                      className="ad-quick-btn"
                      onClick={() => {
                        const uid = prompt("Enter User ID to deactivate:");
                        if (uid) handleDeactivateUser(Number(uid));
                      }}
                    >
                      <UserX size={16} />
                      Deactivate User
                    </button>
                    <button className="ad-quick-btn" onClick={loadAdminData}>
                      <ShieldCheck size={16} />
                      Sync Platform Stats
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}