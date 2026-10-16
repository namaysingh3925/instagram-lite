import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";
import { fileToBase64 } from "../utils/fileToBase64";

export default function CreatePost() {
  const navigate = useNavigate();

  const [image, setImage] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const base64 = await fileToBase64(file);
    setImage(base64);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!image) {
      setError("Please choose an image");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const post = await createPost({ image, caption });
      navigate(`/post/${post._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="create-post-page">
      <h2>Create new post</h2>

      <form onSubmit={handleSubmit} className="create-post-form">
        <label className="image-drop">
          {image ? (
            <img src={image} alt="Preview" />
          ) : (
            <span>Click to choose a photo</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />
        </label>

        <textarea
          placeholder="Write a caption..."
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={3}
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sharing..." : "Share"}
        </button>
      </form>
    </div>
  );
}
