import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { followUser, getUserProfile, unfollowUser } from "../api/users";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/Avatar";

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    try {
      const data = await getUserProfile(id);
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile");
    }
  }

  async function toggleFollow() {
    if (profile.isFollowing) {
      await unfollowUser(id);
    } else {
      await followUser(id);
    }

    loadProfile();
  }

  if (error) {
    return <p className="error-text center">{error}</p>;
  }

  if (!profile) {
    return <p className="muted center">Loading profile...</p>;
  }

  const isOwnProfile = id === currentUser?.id;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <Avatar src={profile.user.profilePicture} size={90} />

        <div className="profile-info">
          <div className="profile-title-row">
            <h2>{profile.user.username}</h2>

            {isOwnProfile ? (
              <button onClick={() => navigate(`/profile/${id}/edit`)}>
                Edit profile
              </button>
            ) : (
              <button onClick={toggleFollow}>
                {profile.isFollowing ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <div className="profile-stats">
            <span>
              <strong>{profile.postsCount}</strong> posts
            </span>
            <span>
              <strong>{profile.followersCount}</strong> followers
            </span>
            <span>
              <strong>{profile.followingCount}</strong> following
            </span>
          </div>

          <p className="profile-name">{profile.user.name}</p>
          {profile.user.bio && <p className="profile-bio">{profile.user.bio}</p>}
        </div>
      </div>

      <div className="profile-grid">
        {profile.posts.map((post) => (
          <Link to={`/post/${post._id}`} key={post._id} className="profile-grid-item">
            <img src={post.image} alt={post.caption} />
          </Link>
        ))}

        {profile.posts.length === 0 && (
          <p className="muted center">No posts yet.</p>
        )}
      </div>
    </div>
  );
}
