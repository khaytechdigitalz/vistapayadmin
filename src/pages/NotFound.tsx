import React from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export const NotFound: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-6 text-center">
      <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-secondary">
        <Compass size={24} />
      </span>
      <h1 className="text-3xl font-extrabold text-ink-900">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-ink-900/60">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/app/dashboard" className="btn-primary mt-6">
        Back to Dashboard
      </Link>
    </div>
  );
};
