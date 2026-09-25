import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fileToBase64 } from "../utils/fileToBase64";
import Avatar from "../components/Avatar";

const initialForm = {
  name: "",
  username: "",
  email: "",
  password: "",
  bio: "",
  profilePicture: ""
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handlePhotoChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const base64 = await fileToBase64(file);
    setForm({ ...form, profilePicture: base64 });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="brand-title">Instagram Lite</h1>

        <form onSubmit={handleSubmit}>
          <div className="photo-picker">
            <Avatar src={form.profilePicture} size={64} />
            <label className="upload-label">
              Choose photo
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                hidden
              />
            </label>
          </div>

          <input
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <textarea
            name="bio"
            placeholder="Bio (optional)"
            value={form.bio}
            onChange={handleChange}
            rows={2}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
