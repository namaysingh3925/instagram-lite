import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteReportedPost,
  getReportedPosts,
  markPostSafe
} from "../api/reports";
import Avatar from "../components/Avatar";

export default function Review() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      setItems(await getReportedPosts());
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reported posts");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDecision(action, postId) {
    if (action === "delete" && !window.confirm("Delete this post permanently?")) {
      return;
    }

    try {
      if (action === "delete") {
        await deleteReportedPost(postId);
      } else {
        await markPostSafe(postId);
      }

      setItems((prev) => prev.filter((item) => item.post._id !== postId));
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  }

  if (isLoading) {
    return <p className="muted center">Loading reported posts...</p>;
  }

  if (error) {
    return <p className="error-text center">{error}</p>;
  }

  return (
    <div className="review-page">
      <h2>Review reported posts</h2>

      {items.length === 0 && (
        <p className="muted center">Nothing to review right now.</p>
      )}

      {items.map(({ post, reportCount, reporters }) => (
        <article className="post-card" key={post._id}>
          <div className="post-header">
            <Avatar src={post.author?.profilePicture} size={32} />
            <Link to={`/profile/${post.author?._id}`} className="post-username">
              {post.author?.username}
            </Link>
            <span className="report-badge">
              {reportCount} {reportCount === 1 ? "report" : "reports"}
            </span>
          </div>

          <img className="post-image" src={post.image} alt={post.caption} />

          {post.caption && (
            <p className="post-caption">
              <strong>{post.author?.username}</strong> {post.caption}
            </p>
          )}

          <p className="muted review-reporters">
            Reported by: {reporters.join(", ")}
          </p>

          <div className="review-actions">
            <button
              className="danger-button"
              onClick={() => handleDecision("delete", post._id)}
            >
              Delete post
            </button>
            <button
              className="safe-button"
              onClick={() => handleDecision("safe", post._id)}
            >
              Mark as safe
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
