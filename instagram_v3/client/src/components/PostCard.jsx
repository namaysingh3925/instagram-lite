import { Link } from "react-router-dom";
import { useState } from "react";
import { likePost, unlikePost } from "../api/posts";
import Avatar from "./Avatar";
import CommentSection from "./CommentSection";

export default function PostCard({ post }) {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [showComments, setShowComments] = useState(false);

  async function toggleLike() {
    const wasLiked = isLiked;

    setIsLiked(!wasLiked);
    setLikesCount((count) => count + (wasLiked ? -1 : 1));

    try {
      if (wasLiked) {
        await unlikePost(post._id);
      } else {
        await likePost(post._id);
      }
    } catch {
      setIsLiked(wasLiked);
      setLikesCount((count) => count + (wasLiked ? 1 : -1));
    }
  }

  return (
    <article className="post-card">
      <div className="post-header">
        <Avatar src={post.author?.profilePicture} size={32} />
        <Link to={`/profile/${post.author?._id}`} className="post-username">
          {post.author?.username}
        </Link>
      </div>

      <img className="post-image" src={post.image} alt={post.caption} />

      <div className="post-actions">
        <button
          className={`like-button ${isLiked ? "liked" : ""}`}
          onClick={toggleLike}
        >
          {isLiked ? "♥" : "♡"}
        </button>
        <button
          className="link-button"
          onClick={() => setShowComments((prev) => !prev)}
        >
          Comment
        </button>
        <Link to={`/post/${post._id}`} className="link-button">
          View post
        </Link>
      </div>

      <p className="likes-count">
        {likesCount} {likesCount === 1 ? "like" : "likes"}
      </p>

      {post.caption && (
        <p className="post-caption">
          <strong>{post.author?.username}</strong> {post.caption}
        </p>
      )}

      {showComments && <CommentSection postId={post._id} />}
    </article>
  );
}
