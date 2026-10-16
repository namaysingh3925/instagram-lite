import { useState } from "react";
import { reportPost } from "../api/reports";

export default function ReportButton({ postId }) {
  const [isReported, setIsReported] = useState(false);

  async function handleReport() {
    if (isReported || !window.confirm("Report this post for review?")) {
      return;
    }

    try {
      await reportPost(postId);
    } catch (err) {
      if (err.response?.status !== 409) {
        alert(err.response?.data?.message || "Failed to report post");
        return;
      }
    }

    setIsReported(true);
  }

  return (
    <button
      className={`report-button ${isReported ? "reported" : ""}`}
      onClick={handleReport}
      title={isReported ? "Reported" : "Report post"}
      aria-label="Report post"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill={isReported ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22V4" />
        <path d="M4 4h13l-2 4 2 4H4" />
      </svg>
    </button>
  );
}
