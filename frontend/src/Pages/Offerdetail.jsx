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
  Truck,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { getOfferById } from "../data/Offerstore";
import { isBookmarked, toggleBookmark } from "../data/Bookmarksstore";
import "../Css/Offers.css";
import "../Css/Offerdetail.css";

const dummyReviews = [
  { name: "Priya K.", rating: 5, text: "Exactly as described, super easy pickup." },
  { name: "Owen R.", rating: 5, text: "Generous and quick to respond." },
  { name: "Nina W.", rating: 4, text: "Would borrow from them again." },
];

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const offer = getOfferById(id);
  const [bookmarked, setBookmarked] = useState(() => (offer ? isBookmarked(offer.id, "offer") : false));

  if (!offer) {
    return (
      <div className="of-page">
        <div className="of-shell">
          <Sidebar tagline="Hyperlocal Community Network" />
          <main className="of-main">
            <div className="od-not-found">
              <h2>Offer not found</h2>
              <p>This offer may have been removed or the link is incorrect.</p>
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

  return (
    <div className="of-page">
      <div className="of-shell">
        <Sidebar tagline="Hyperlocal Community Network" />

        <main className="of-main">
          <button className="of-back" onClick={() => navigate("/offers")}>
            <ArrowLeft size={15} />
            Back to Offers
          </button>

          <div className="od-layout">
            {/* Left column */}
            <div className="od-primary">
              <div className="od-gallery">
                <ImagePlus size={40} />
                <span>No photo provided</span>
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
                  <span><MapPin size={13} /> {offer.location} • {offer.distance} km</span>
                  <span><Clock3 size={13} /> {offer.availability}</span>
                  <span><Truck size={13} /> {offer.pickupOption}</span>
                </div>

                <p className="od-description">{offer.description}</p>

                {offer.tags?.length > 0 && (
                  <div className="of-tags">
                    {offer.tags.map((tag) => (
                      <span key={tag} className="of-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="od-card">
                <h2 className="od-section-title">Reviews</h2>
                <div className="od-reviews">
                  {dummyReviews.map((r) => (
                    <div key={r.name} className="od-review">
                      <div className="od-review-top">
                        <strong>{r.name}</strong>
                        <span className="od-stars">
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

                <button className="od-request-btn" onClick={() => navigate("/messages")}>
                  <MessageCircle size={16} />
                  Request this
                </button>

                <div className="od-action-row">
                  <button
                    className={`od-action-btn ${bookmarked ? "active" : ""}`}
                    onClick={() => setBookmarked(toggleBookmark(offer.id, "offer"))}
                  >
                    <Bookmark size={15} fill={bookmarked ? "#e8a23d" : "none"} />
                    Save
                  </button>
                  <button className="od-action-btn">
                    <Share2 size={15} />
                    Share
                  </button>
                  <button className="od-action-btn">
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
                  <div><span>Distance</span><strong>{offer.distance} km</strong></div>
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