import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getUserProfile, updateUserProfile } from "../api/users";
import { fileToBase64 } from "../utils/fileToBase64";
import Avatar from "../components/Avatar";

export default function EditProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", bio: "", profilePicture: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    const data = await getUserProfile(id);

    setForm({
      name: data.user.name,
      bio: data.user.bio || "",
      profilePicture: data.user.profilePicture || ""
    });
  }

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
      await updateUserProfile(id, form);
      navigate(`/profile/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="edit-profile-page">
      <h2>Edit profile</h2>

      <form onSubmit={handleSubmit} className="edit-profile-form">
        <div className="photo-picker">
          <Avatar src={form.profilePicture} size={64} />
          <label className="upload-label">
            Change photo
            <input type="file" accept="image/*" onChange={handlePhotoChange} hidden />
          </label>
        </div>

        <input
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <textarea
          name="bio"
          placeholder="Bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
