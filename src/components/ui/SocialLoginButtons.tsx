import React from "react";

const GoogleIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20.5H24v7h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.6 15.7 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16 4 9.1 8.5 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 36.1 27 37 24 37c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.1 40.5 16 45 24 45z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.6C41.4 35.6 44 30.3 44 24c0-1.2-.1-2.4-.4-3.5z"
    />
  </svg>
);

const AppleIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

export const SocialLoginButtons: React.FC = () => {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-surface-border bg-white px-4 py-3 text-sm font-semibold text-ink-900 transition hover:bg-surface-muted"
      >
        <GoogleIcon />
        Google
      </button>
      <button
        type="button"
        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/85"
      >
        <AppleIcon />
        Apple
      </button>
    </div>
  );
};
