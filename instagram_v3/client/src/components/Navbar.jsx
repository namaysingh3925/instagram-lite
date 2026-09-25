import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          Instagram Lite
        </Link>

        {isAuthenticated && user && (
          <nav className="navbar-links">
            <Link to="/">Home</Link>
            <Link to="/search">Search</Link>
            <Link to="/create">Create</Link>
            <Link to={`/profile/${user.id}`}>Profile</Link>
            <button className="link-button" onClick={handleLogout}>
              Logout
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
