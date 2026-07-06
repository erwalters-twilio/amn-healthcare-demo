import { useState } from 'react';
import './ResetButton.css';

export default function ResetButton() {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = () => {
    setIsResetting(true);

    // Clear all Segment data from localStorage and cookies
    // This includes the anonymous ID
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('ajs_') || key.includes('segment')) {
        localStorage.removeItem(key);
      }
    });

    // Clear Segment cookies
    document.cookie.split(';').forEach((cookie) => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith('ajs_') || cookieName.includes('segment')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });

    console.log('[Demo] Segment anonymous ID reset. Reloading...');

    // Reload the page after a brief delay to show the animation
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  return (
    <button
      className={`reset-button ${isResetting ? 'resetting' : ''}`}
      onClick={handleReset}
      disabled={isResetting}
      title="Reset Segment anonymous ID and start fresh demo"
    >
      {isResetting ? (
        <>
          <span className="reset-icon spinning">🔄</span>
          <span>Resetting...</span>
        </>
      ) : (
        <>
          <span className="reset-icon">🔄</span>
          <span>Reset Demo</span>
        </>
      )}
    </button>
  );
}
