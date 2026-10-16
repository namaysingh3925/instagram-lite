import { useEffect, useState } from "react";
import { addComment, deleteComment, getComments } from "../api/posts";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function CommentSection({ postId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function loadComments() {
    setIsLoading(true);

    const data = await getComments(postId);

    setComments(data);
    setIsLoading(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    await addComment(postId, text.trim());

    setText("");
    loadComments();
  }

  async function handleDelete(commentId) {
    await deleteComment(commentId);
    loadComments();
  }

  return (
    <div className="comment-section">
      {isLoading ? (
        <p className="muted">Loading comments...</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment._id} className="comment-item">
              <Avatar src={comment.author?.profilePicture} size={28} />
              <span className="comment-text">
                <strong>{comment.author?.username}</strong> {comment.text}
              </span>

              {comment.author?._id === user?.id && (
                <button
                  className="link-button muted"
                  onClick={() => handleDelete(comment._id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}

          {comments.length === 0 && (
            <li className="muted">No comments yet.</li>
          )}
        </ul>
      )}

      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" disabled={!text.trim()}>
          Post
        </button>
      </form>
    </div>
  );
}
