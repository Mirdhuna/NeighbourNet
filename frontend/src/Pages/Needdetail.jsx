import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock3,
  ShieldCheck,
  Bookmark,
  Share2,
  Flag,
  MessageCircle,
  Star,
  ImagePlus,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { getNeedById } from "../data/Needsstore";
import { isBookmarked, toggleBookmark } from "../data/Bookmarksstore";
import "../Css/Needs.css";
import "../Css/Needdetail.css";

const dummyReviews = [
  { name: "Priya K.", rating: 5, text: "Reliable and kind, showed up right on time." },
  { name: "Owen R.", rating: 5, text: "Great communicator, would help again." },
  { name: "Nina W.", rating: 4, text: "Everything went smoothly." },
];

export default function NeedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const need = getNeedById(id);
  const [bookmarked, setBookmarked] = useState(() => (need ? isBookmarked(need.id, "need") : false));

  if (!need) {
    return (
      <div className="nn-page">
        <div className="nn-shell">
          <Sidebar tagline="Hyperlocal help requests" />
          <main className="nn-main">
            <div className="nd-not-found">
              <h2>Need not found</h2>
              <p>This request may have been removed or the link is incorrect.</p>
              <Link to="/needs" className="nf-back">
                <ArrowLeft size={15} />
                Back to Needs
              </Link>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="nn-page">
      <div className="nn-shell">
        <Sidebar tagline="Hyperlocal help requests" />

        <main className="nn-main">
          <button className="nf-back" onClick={() => navigate("/needs")}>
            <ArrowLeft size={15} />
            Back to Needs
          </button>

          <div className="nd-layout">
            {/* Left column */}
            <div className="nd-primary">
              <div className="nd-gallery">
                <ImagePlus size={40} />
                <span>No photo provided</span>
              </div>

              <div className="nd-card">
                <div className="nn-badges">
                  <span className="nn-badge category">{need.category}</span>
                  <span className={`nn-badge urgency ${need.urgency}`}>{need.urgency}</span>
                  {need.verified && (
                    <span className="nn-badge verified">
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  )}
                </div>

                <h1 className="nd-title">{need.title}</h1>

                <div className="nd-meta-row">
                  <span><MapPin size={13} /> {need.location} • {need.distance} km</span>
                  <span><Clock3 size={13} /> {need.duration}</span>
                </div>

                <p className="nd-description">{need.description}</p>

                {need.tags?.length > 0 && (
                  <div className="nn-tags">
                    {need.tags.map((tag) => (
                      <span key={tag} className="nn-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="nd-card">
                <h2 className="nd-section-title">Reviews</h2>
                <div className="nd-reviews">
                  {dummyReviews.map((r) => (
                    <div key={r.name} className="nd-review">
                      <div className="nd-review-top">
                        <strong>{r.name}</strong>
                        <span className="nd-stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={13}
                              fill={i < r.rating ? "#e8a23d" : "none"}
                              color={i < r.rating ? "#e8a23d" : "#dde6df"}
                            />
                          ))}
                        </span>
                      </div>
                      <p>{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="nd-side">
              <div className="nd-card">
                <div className="nd-owner-row">
                  <div className="nn-avatar nd-avatar-lg">{need.requesterInitial}</div>
                  <div>
                    <div className="nd-owner-name">
                      {need.requesterName}
                      {need.verified && <ShieldCheck size={14} className="nd-verified-icon" />}
                    </div>
                    <div className="nd-owner-sub">{need.time}</div>
                  </div>
                </div>

                <button className="nd-request-btn" onClick={() => navigate("/messages")}>
                  <MessageCircle size={16} />
                  Offer to help
                </button>

                <div className="nd-action-row">
                  <button
                    className={`nd-action-btn ${bookmarked ? "active" : ""}`}
                    onClick={() => setBookmarked(toggleBookmark(need.id, "need"))}
                  >
                    <Bookmark size={15} fill={bookmarked ? "#e8a23d" : "none"} />
                    Save
                  </button>
                  <button className="nd-action-btn">
                    <Share2 size={15} />
                    Share
                  </button>
                  <button className="nd-action-btn">
                    <Flag size={15} />
                    Report
                  </button>
                </div>
              </div>

              <div className="nd-card">
                <h2 className="nd-section-title">Details</h2>
                <div className="nd-detail-list">
                  <div><span>Location</span><strong>{need.location}</strong></div>
                  <div><span>Duration</span><strong>{need.duration}</strong></div>
                  <div><span>Distance</span><strong>{need.distance} km</strong></div>
                  <div><span>Urgency</span><strong className="nd-capitalize">{need.urgency}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}