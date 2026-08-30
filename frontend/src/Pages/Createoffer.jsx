import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  MapPin,
  Sparkles,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { apiFetch } from "../api";
import "../Css/Offers.css";
import "../Css/Offerform.css";

const categories = ["Food", "Tools", "Household", "Education", "Equipment"];
const conditions = ["Like new", "Good", "Fair", "Fresh", "N/A"];
const pickupOptions = ["Pickup only", "Can deliver", "Either"];

export default function CreateOffer() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [condition, setCondition] = useState(conditions[0]);
  const [availability, setAvailability] = useState("");
  const [pickupOption, setPickupOption] = useState(pickupOptions[0]);
  const [location, setLocation] = useState("");
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setImageName(file ? file.name : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError("Please fill in the title, description, and location before posting.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const data = await apiFetch("/api/offers", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          condition,
          availability: availability.trim() || "Flexible",
          pickupOption,
          location: location.trim(),
          radius: 5,
          photo: null,
          tags: [category],
        }),
      });
      navigate(`/offers/${data.id}`);
    } catch (err) {
      setError(err.message || "Could not post the offer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="of-page">
      <div className="of-shell">
        <Sidebar tagline="Hyperlocal Community Network" />

        <main className="of-main">
          <button className="of-back" onClick={() => navigate("/offers")}>
            <ArrowLeft size={15} />
            Back to Offers
          </button>

          <section className="of-hero">
            <div className="of-hero-badge">
              <Sparkles size={14} />
              New offer
            </div>
            <h1>Create an offer</h1>
            <p>Share an item, service, or spare of anything with your neighbors nearby.</p>
          </section>

          <form className="of-form-card" onSubmit={handleSubmit}>
            {error && (
              <div className="of-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <label className="of-field">
              <span className="of-form-label">Offer title</span>
              <input
                type="text"
                className="of-form-input"
                placeholder="e.g. Cordless drill, barely used"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="of-field">
              <span className="of-form-label">Description</span>
              <textarea
                className="of-form-textarea"
                rows={4}
                placeholder="What are you offering, and any conditions..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <div className="of-form-grid-2">
              <label className="of-field">
                <span className="of-form-label">Category</span>
                <select className="of-form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="of-field">
                <span className="of-form-label">Condition</span>
                <select className="of-form-select" value={condition} onChange={(e) => setCondition(e.target.value)}>
                  {conditions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="of-form-grid-2">
              <label className="of-field">
                <span className="of-form-label">Availability</span>
                <input
                  type="text"
                  className="of-form-input"
                  placeholder="e.g. Weekends"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </label>

              <label className="of-field">
                <span className="of-form-label">Pickup option</span>
                <select className="of-form-select" value={pickupOption} onChange={(e) => setPickupOption(e.target.value)}>
                  {pickupOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="of-field">
              <span className="of-form-label">Location</span>
              <div className="of-form-input-icon">
                <MapPin size={15} />
                <input
                  type="text"
                  placeholder="e.g. Singānallūr, Coimbatore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </label>

            <label className="of-field">
              <span className="of-form-label">Photo (optional)</span>
              <label className="of-dropzone" htmlFor="of-image-input">
                <Camera size={22} />
                <span>{imageName || "Click to upload a photo"}</span>
              </label>
              <input
                id="of-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="of-file-input"
              />
            </label>

            <button type="submit" className="of-submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post offer"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}