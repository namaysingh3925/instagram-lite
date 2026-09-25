import { useState } from "react";
import { Link } from "react-router-dom";
import { searchUsers } from "../api/users";
import Avatar from "../components/Avatar";

export default function Search() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!query.trim()) {
      return;
    }

    const data = await searchUsers(query.trim());

    setUsers(data.users);
    setHasSearched(true);
  }

  return (
    <div className="search-page">
      <form onSubmit={handleSubmit} className="search-form">
        <input
          placeholder="Search users..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <ul className="search-results">
        {users.map((user) => (
          <li key={user._id}>
            <Link to={`/profile/${user._id}`} className="search-result">
              <Avatar src={user.profilePicture} size={44} />
              <div>
                <strong>{user.username}</strong>
                <div className="muted">{user.name}</div>
              </div>
            </Link>
          </li>
        ))}

        {hasSearched && users.length === 0 && (
          <li className="muted">No users found.</li>
        )}
      </ul>
    </div>
  );
}
