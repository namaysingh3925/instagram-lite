import { useEffect, useState } from "react";
import { getFeed } from "../api/feed";
import PostCard from "../components/PostCard";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    setIsLoading(true);

    try {
      const data = await getFeed();
      setPosts(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return <p className="muted center">Loading feed...</p>;
  }

  if (error) {
    return <p className="error-text center">{error}</p>;
  }

  return (
    <div className="feed-page">
      {posts.length === 0 && (
        <p className="muted center">
          No posts yet. Follow people or create your first post!
        </p>
      )}

      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
}
