import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { deletePost, getPost, likePost, unlikePost, updatePost } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";
import CommentSection from "../components/CommentSection";

export default function PostView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadPost();
  }, [id]);

  async function loadPost() {
    try {
      const data = await getPost(id);
      setPost(data);
      setCaption(data.caption || "");
      setIsLiked(data.isLiked || false);
      setLikesCount(data.likesCount || 0);
    } catch (err) {
      setError(err.response?.data?.message || "Post not found");
    }
  }

  async function toggleLike() {
    const wasLiked = isLiked;

    setIsLiked(!wasLiked);
    setLikesCount((count) => count + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) {
        await unlikePost(id);
      } else {
        await likePost(id);
      }
    } catch {
      setIsLiked(wasLiked);
      setLikesCount((count) => count + (wasLiked ? 1 : -1));
    }
  }

  async function handleUpdate() {
    const updated = await updatePost(id, { caption });
    setPost(updated);
    setIsEditing(false);
  }

  async function handleDelete() {
    await deletePost(id);
    navigate("/");
  }

  if (error) {
    return <p className="error-text center">{error}</p>;
  }

  if (!post) {
    return <p className="muted center">Loading post...</p>;
  }

  const isOwnPost = post.author?._id === user?.id;

  return (
    <div className="post-view-page">
      <article className="post-card">
        <div className="post-header">
          <Avatar src={post.author?.profilePicture} size={32} />
          <span className="post-username">{post.author?.username}</span>

          {isOwnPost && (
            <div className="post-owner-actions">
              <button className="link-button" onClick={() => setIsEditing((v) => !v)}>
                Edit
              </button>
              <button className="link-button danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>

        <img className="post-image" src={post.image} alt={post.caption} />

        <div className="post-actions">
          <button className={`like-button ${isLiked ? "liked" : ""}`} onClick={toggleLike}>
            {isLiked ? "♥" : "♡"}
          </button>
        </div>

        <p className="likes-count">
          {likesCount} {likesCount === 1 ? "like" : "likes"}
        </p>

        {isEditing ? (
          <div className="edit-caption">
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={2}
            />
            <button onClick={handleUpdate}>Save</button>
          </div>
        ) : (
          post.caption && (
            <p className="post-caption">
              <strong>{post.author?.username}</strong> {post.caption}
            </p>
          )
        )}

        <CommentSection postId={post._id} />
      </article>
    </div>
  );
}
