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
import "../Css/Needs.css";
import "../Css/Needform.css";

const categories = ["Food", "Medicine", "Transport", "Tools", "Household", "Education"];
const urgencies = ["low", "medium", "high", "emergency"];

export default function CreateNeed() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [urgency, setUrgency] = useState("medium");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("5");
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
      setError(
        "Please fill in the title, description, and location before posting."
      );
      return;
    }
  
    setError("");
    setSubmitting(true);
  
    try {
      const data = await apiFetch("/api/needs", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          urgency,
          duration: duration.trim() || "Flexible",
          location: location.trim(),
          radius: Number(radius),
          photo: null,
          tags: [category],
        }),
      });

      navigate(`/needs/${data.id}`);
    } catch (err) {
      console.error("Failed to create need:", err);
      setError(err.message || "Could not post the need.");
    } finally {
      setSubmitting(false);
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

          <section className="nn-hero">
            <div className="nn-hero-badge">
              <Sparkles size={14} />
              New request
            </div>
            <h1>Post a need</h1>
            <p>Tell your neighbors what you're looking for — the more detail, the faster you'll get a match.</p>
          </section>

          <form className="nf-card" onSubmit={handleSubmit}>
            {error && (
              <div className="nf-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <label className="nf-field">
              <span className="nf-label">Need title</span>
              <input
                type="text"
                className="nf-input"
                placeholder="e.g. Need a pressure cooker for 2 days"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="nf-field">
              <span className="nf-label">Description</span>
              <textarea
                className="nf-textarea"
                rows={4}
                placeholder="Add a few helpful details — what exactly you need, and why."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <div className="nf-grid-2">
              <label className="nf-field">
                <span className="nf-label">Category</span>
                <select className="nf-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="nf-field">
                <span className="nf-label">Urgency level</span>
                <select className="nf-select" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                  {urgencies.map((u) => (
                    <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="nf-grid-2">
              <label className="nf-field">
                <span className="nf-label">Duration needed</span>
                <input
                  type="text"
                  className="nf-input"
                  placeholder="e.g. 2 days"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </label>

              <label className="nf-field">
                <span className="nf-label">Search radius</span>
                <select className="nf-select" value={radius} onChange={(e) => setRadius(e.target.value)}>
                  <option value="1">1 km</option>
                  <option value="3">3 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                </select>
              </label>
            </div>

            <label className="nf-field">
              <span className="nf-label">Location</span>
              <div className="nf-input-icon">
                <MapPin size={15} />
                <input
                  type="text"
                  placeholder="e.g. Singānallūr, Coimbatore"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </label>

            <label className="nf-field">
            <span className="nf-label">Photo (optional)</span>
            <label className="nf-dropzone" htmlFor="nf-image-input">
              <Camera size={22} />
              <span>{imageName || "Click to upload a photo"}</span>
            </label>
              <input
                id="nf-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="nf-file-input"
              />
            </label>

            <button type="submit" className="nf-submit" disabled={submitting}>
              {submitting ? "Posting..." : "Post need"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}