const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#dbdbdb" />
      <circle cx="50" cy="38" r="18" fill="#ffffff" />
      <ellipse cx="50" cy="88" rx="30" ry="22" fill="#ffffff" />
    </svg>`
  );

export default function Avatar({ src, size = 40, alt = "" }) {
  return (
    <img
      className="avatar"
      src={src || DEFAULT_AVATAR}
      alt={alt}
      style={{ width: size, height: size }}
    />
  );
}
