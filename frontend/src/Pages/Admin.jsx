import React, { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PackageSearch,
  Megaphone,
  MessageCircle,
  BookmarkCheck,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  Search,
  Users,
  ShieldCheck,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CircleDollarSign,
  Sparkles,
  BarChart3,
  Activity,
  ArrowUpRight,
  Plus,
  Filter,
  MoreVertical,
} from "lucide-react";
import "../Css/Admin.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/needs", label: "Needs", icon: PackageSearch },
  { to: "/offers", label: "Offers", icon: Megaphone },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/bookmarks", label: "Bookmarks", icon: BookmarkCheck },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

const stats = [
  { label: "Total Users", value: "12.4K", change: "+8.2%", icon: Users, tone: "blue" },
  { label: "Active Needs", value: "3.8K", change: "+12.4%", icon: FileText, tone: "peach" },
  { label: "Trusted Offers", value: "2.9K", change: "+4.1%", icon: ShieldCheck, tone: "green" },
  { label: "Resolved Today", value: "624", change: "+18.7%", icon: CheckCircle2, tone: "yellow" },
];

const recentRows = [
  { name: "Anjali", type: "Need", category: "Household", status: "Pending", time: "2m ago" },
  { name: "Ravi", type: "Offer", category: "Medicine", status: "Approved", time: "12m ago" },
  { name: "Meena", type: "Need", category: "Education", status: "Verified", time: "1h ago" },
  { name: "Suresh", type: "Offer", category: "Tools", status: "Flagged", time: "2h ago" },
];

const alerts = [
  "5 new needs were posted in your local zone.",
  "2 offers need admin review.",
  "1 user reported a duplicate request.",
  "Verification queue has 14 pending profiles.",
];

export default function Admin() {
  const [query, setQuery] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [range, setRange] = useState("7d");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recentRows;
    return recentRows.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.type.toLowerCase().includes(q) ||
        row.category.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="ad-page">
      <div className="ad-shell">
        <aside className={`ad-sidebar ${mobileNavOpen ? "open" : ""}`}>
          <div className="ad-sidebar-top">
            <div className="ad-logo-row">
              <div className="ad-logo-mark">
                <span>N</span>
              </div>
              <div>
                <div className="ad-logo-text">NeighborNet</div>
                <div className="ad-sidebar-tag">Admin Control Panel</div>
              </div>
            </div>

            <button className="ad-close-btn" onClick={() => setMobileNavOpen(false)}>
              <LogOut size={16} />
            </button>
          </div>

          <nav className="ad-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `ad-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="ad-side-card">
            <div className="ad-side-card-title">System Health</div>
            <div className="ad-side-mini">
              <Activity size={14} />
              <span>99.98% uptime</span>
            </div>
            <div className="ad-side-mini">
              <ShieldCheck size={14} />
              <span>Moderation running</span>
            </div>
            <div className="ad-side-mini">
              <Sparkles size={14} />
              <span>AI suggestions enabled</span>
            </div>
          </div>

          <button className="ad-logout-btn">
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        <main className="ad-main">
          <header className="ad-topbar">
            <div className="ad-top-left">
              <button className="ad-menu-btn" onClick={() => setMobileNavOpen(true)}>
                <Menu size={20} />
              </button>

              <div>
                <div className="ad-kicker">Admin</div>
                <h1>Dashboard</h1>
              </div>
            </div>

            <div className="ad-top-actions">
              <div className="ad-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search users, needs, offers..."
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

          <section className="ad-stats-grid">
            {stats.map((item) => {
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
                  <h2>Overview</h2>
                  <p>Platform activity for the selected period</p>
                </div>
                <button className="ad-panel-btn">
                  <Plus size={15} />
                  Add Report
                </button>
              </div>

              <div className="ad-chart-box">
                <div className="ad-chart-bars">
                  <span style={{ height: "40%" }} />
                  <span style={{ height: "68%" }} />
                  <span style={{ height: "52%" }} />
                  <span style={{ height: "78%" }} />
                  <span style={{ height: "60%" }} />
                  <span style={{ height: "88%" }} />
                  <span style={{ height: "72%" }} />
                </div>

                <div className="ad-chart-legend">
                  <div><span className="dot blue" /> Needs</div>
                  <div><span className="dot peach" /> Offers</div>
                  <div><span className="dot green" /> Resolved</div>
                </div>
              </div>
            </div>

            <div className="ad-panel ad-alert-panel">
              <div className="ad-panel-head">
                <div>
                  <h2>Alerts</h2>
                  <p>Things that need attention</p>
                </div>
                <button className="ad-icon-btn">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="ad-alert-list">
                {alerts.map((a) => (
                  <div key={a} className="ad-alert-item">
                    <AlertTriangle size={16} />
                    <span>{a}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ad-panel ad-table-panel">
              <div className="ad-panel-head">
                <div>
                  <h2>Recent Activity</h2>
                  <p>Latest actions and submissions</p>
                </div>
                <button className="ad-panel-btn secondary">
                  <Filter size={15} />
                  Filter
                </button>
              </div>

              <div className="ad-table-wrap">
                <table className="ad-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={`${row.name}-${row.time}`}>
                        <td>{row.name}</td>
                        <td>{row.type}</td>
                        <td>{row.category}</td>
                        <td>
                          <span className={`ad-pill ${row.status.toLowerCase()}`}>
                            {row.status}
                          </span>
                        </td>
                        <td>{row.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="ad-panel ad-quick-panel">
              <div className="ad-panel-head">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Fast admin shortcuts</p>
                </div>
              </div>

              <div className="ad-quick-list">
                <button className="ad-quick-btn">
                  <Users size={16} />
                  Review Users
                </button>
                <button className="ad-quick-btn">
                  <ShieldCheck size={16} />
                  Verify Requests
                </button>
                <button className="ad-quick-btn">
                  <Clock3 size={16} />
                  Pending Queue
                </button>
                <button className="ad-quick-btn">
                  <CircleDollarSign size={16} />
                  Payments Report
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}