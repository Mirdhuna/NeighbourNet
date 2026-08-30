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
  Truck,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { apiFetch } from "../api";
import "../Css/Offers.css";
import "../Css/Offerdetail.css";

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiFetch(`/api/offers/${id}`);
        setOffer(data);
        try {
          const check = await apiFetch(`/api/bookmarks/check?item_id=${id}&item_type=offer`);
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
        setOffer(null);
        setError(err.message || "Offer not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="of-page">
        <div className="of-shell">
          <Sidebar tagline="Share what you have" createTo="/offers/new" />
          <main className="of-main">
            <div className="od-not-found"><h2>Loading…</h2></div>
          </main>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="of-page">
        <div className="of-shell">
          <Sidebar tagline="Hyperlocal Community Network" createTo="/offers/new" />
          <main className="of-main">
            <div className="od-not-found">
              <h2>Offer not found</h2>
              <p>{error || "This offer may have been removed or the link is incorrect."}</p>
              <Link to="/offers" className="of-back">
                <ArrowLeft size={15} />
                Back to Offers
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
        body: JSON.stringify({ item_id: offer.id, item_type: "offer" }),
      });
      setBookmarked(Boolean(result.bookmarked));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("Why are you reporting this offer?");
    if (!reason || !reason.trim()) return;
    try {
      await apiFetch(`/api/offers/${offer.id}/report`, {
        method: "POST",
        body: JSON.stringify({ reason: reason.trim() }),
      });
      window.alert("Report submitted.");
    } catch (err) {
      window.alert(err.message || "Could not submit report.");
    }
  };

  const handleRequest = async () => {
    if (!offer.owner_user_id) {
      navigate("/messages");
      return;
    }
    try {
      const convo = await apiFetch("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ other_user_id: offer.owner_user_id }),
      });
      navigate(`/messages/${convo.id}`);
    } catch {
      navigate("/messages");
    }
  };

  return (
    <div className="of-page">
      <div className="of-shell">
        <Sidebar tagline="Hyperlocal Community Network" createTo="/offers/new" />

        <main className="of-main">
          <button className="of-back" onClick={() => navigate("/offers")}>
            <ArrowLeft size={15} />
            Back to Offers
          </button>

          <div className="od-layout">
            <div className="od-primary">
              <div className="od-gallery">
                <ImagePlus size={40} />
                <span>{offer.photo ? "Photo on file" : "No photo provided"}</span>
              </div>

              <div className="od-card">
                <div className="of-badges">
                  <span className="of-badge category">{offer.category}</span>
                  <span className="of-badge condition">{offer.condition}</span>
                  {offer.verified && (
                    <span className="of-badge verified">
                      <ShieldCheck size={12} />
                      Verified
                    </span>
                  )}
                </div>

                <h1 className="od-title">{offer.title}</h1>

                <div className="od-meta-row">
                  <span><MapPin size={13} /> {offer.location}{offer.distance != null ? ` • ${offer.distance} km` : ""}</span>
                  <span><Clock3 size={13} /> {offer.availability}</span>
                  <span><Truck size={13} /> {offer.pickupOption}</span>
                </div>

                <p className="od-description">{offer.description}</p>

                {(offer.tags || []).length > 0 && (
                  <div className="of-tags">
                    {(offer.tags || []).map((tag) => (
                      <span key={tag} className="of-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="od-card">
                <h2 className="od-section-title">Reviews</h2>
                <div className="od-reviews">
                  {reviews.length === 0 ? (
                    <p>No reviews yet.</p>
                  ) : (
                    reviews.map((r, index) => (
                      <div key={`${r.reviewer_name}-${index}`} className="od-review">
                        <div className="od-review-top">
                          <strong>{r.reviewer_name}</strong>
                          <span className="od-stars">
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

            <div className="od-side">
              <div className="od-card">
                <div className="od-owner-row">
                  <div className="of-avatar od-avatar-lg">{offer.ownerInitial}</div>
                  <div>
                    <div className="od-owner-name">
                      {offer.ownerName}
                      {offer.verified && <ShieldCheck size={14} className="od-verified-icon" />}
                    </div>
                    <div className="od-owner-sub">{offer.time}</div>
                  </div>
                </div>

                <button className="od-request-btn" onClick={handleRequest}>
                  <MessageCircle size={16} />
                  Request this
                </button>

                <div className="od-action-row">
                  <button
                    className={`od-action-btn ${bookmarked ? "active" : ""}`}
                    onClick={handleBookmark}
                  >
                    <Bookmark size={15} fill={bookmarked ? "#e8a23d" : "none"} />
                    Save
                  </button>
                  <button
                    className="od-action-btn"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: offer.title, url: window.location.href }).catch(() => {});
                      } else {
                        navigator.clipboard?.writeText(window.location.href);
                      }
                    }}
                  >
                    <Share2 size={15} />
                    Share
                  </button>
                  <button className="od-action-btn" onClick={handleReport}>
                    <Flag size={15} />
                    Report
                  </button>
                </div>
              </div>

              <div className="od-card">
                <h2 className="od-section-title">Details</h2>
                <div className="od-detail-list">
                  <div><span>Location</span><strong>{offer.location}</strong></div>
                  <div><span>Availability</span><strong>{offer.availability}</strong></div>
                  <div><span>Distance</span><strong>{offer.distance != null ? `${offer.distance} km` : "—"}</strong></div>
                  <div><span>Condition</span><strong>{offer.condition}</strong></div>
                  <div><span>Pickup</span><strong>{offer.pickupOption}</strong></div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
