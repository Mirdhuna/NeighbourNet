import React, { useEffect, useState } from "react";
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
import { apiFetch } from "../api";
import "../Css/Needs.css";
import "../Css/Needdetail.css";

export default function NeedDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [need, setNeed] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiFetch(`/api/needs/${id}`);
        setNeed(data);
        try {
          const check = await apiFetch(`/api/bookmarks/check?item_id=${id}&item_type=need`);
          setBookmarked(Boolean(check.bookmarked));
        } catch {
          setBookmarked(false);
        }
        if (data.owner_user_id) {
          try {
            const reviewRows = await apiFetch(`/api/users/${data.owner_user_id}/reviews`);
            setReviews(reviewRows || []);
          } catch {
            setReviews([]);
          }
        }
      } catch (err) {
        setNeed(null);
        setError(err.message || "Need not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="nn-page">
        <div className="nn-shell">
          <Sidebar tagline="Hyperlocal help requests" />
          <main className="nn-main">
            <div className="nd-not-found">
              <h2>Loading…</h2>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="nn-page">
        <div className="nn-shell">
          <Sidebar tagline="Hyperlocal Community Network" />
          <main className="nn-main">
            <div className="nd-not-found">
              <h2>Need not found</h2>
              <p>{error || "This request may have been removed or the link is incorrect."}</p>
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

  const handleBookmark = async () => {
    try {
      const result = await apiFetch("/api/bookmarks/toggle", {
        method: "POST",
        body: JSON.stringify({ item_id: need.id, item_type: "need" }),
      });
      setBookmarked(Boolean(result.bookmarked));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("Why are you reporting this need?");
    if (!reason || !reason.trim()) return;
    try {
      await apiFetch(`/api/needs/${need.id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      window.alert("Report submitted.");
    } catch (err) {
      window.alert(err.message || "Could not submit report.");
    }
  };

  const handleOfferHelp = async () => {
    if (!need.owner_user_id) {
      navigate("/messages");
      return;
    }
    try {
      const convo = await apiFetch("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ other_user_id: need.owner_user_id }),
      });
      navigate(`/messages/${convo.id}`);
    } catch {
      navigate("/messages");
    }
  };

  return (
    <div className="nn-page">
      <div className="nn-shell">
        <Sidebar tagline="Hyperlocal Community Network" />

        <main className="nn-main">
          <button className="nf-back" onClick={() => navigate("/needs")}>
            <ArrowLeft size={15} />
            Back to Needs
          </button>

          <div className="nd-layout">
            <div className="nd-primary">
              <div className="nd-gallery">
                <ImagePlus size={40} />
                <span>{need.photo ? "Photo on file" : "No photo provided"}</span>
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
                  <span><MapPin size={13} /> {need.location}{need.distance != null ? ` • ${need.distance} km` : ""}</span>
                  <span><Clock3 size={13} /> {need.duration}</span>
                </div>

                <p className="nd-description">{need.description}</p>

                {(need.tags || []).length > 0 && (
                  <div className="nn-tags">
                    {(need.tags || []).map((tag) => (
                      <span key={tag} className="nn-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="nd-card">
                <h2 className="nd-section-title">Reviews</h2>
                <div className="nd-reviews">
                  {reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                  ) : (
                    reviews.map((r, index) => (
                      <div key={`${r.reviewer_name}-${index}`} className="nd-review">
                        <div className="nd-review-top">
                          <strong>{r.reviewer_name}</strong>
                          <span className="nd-stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={13}
                                fill={i < (r.rating || 0) ? "#e8a23d" : "none"}
                                color={i < (r.rating || 0) ? "#e8a23d" : "#dde6df"}
                              />
                            ))}
                          </span>
                        </div>
                        <p>{r.review_text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

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

                <button className="nd-request-btn" onClick={handleOfferHelp}>
                  <MessageCircle size={16} />
                  Offer to help
                </button>

                <div className="nd-action-row">
                  <button
                    className={`nd-action-btn ${bookmarked ? "active" : ""}`}
                    onClick={handleBookmark}
                  >
                    <Bookmark size={15} fill={bookmarked ? "#e8a23d" : "none"} />
                    Save
                  </button>
                  <button
                    className="nd-action-btn"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: need.title, url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                      }
                    }}
                  >
                    <Share2 size={15} />
                    Share
                  </button>
                  <button className="nd-action-btn" onClick={handleReport}>
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
                  <div><span>Distance</span><strong>{need.distance != null ? `${need.distance} km` : "—"}</strong></div>
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
