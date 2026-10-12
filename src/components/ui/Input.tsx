import React, { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, type = "text", className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
      <div className="w-full">
        {label && <label className="label">{label}</label>}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-900/40">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={isPassword ? (show ? "text" : "password") : type}
            className={clsx(
              "input-field",
              icon && "pl-10",
              isPassword && "pr-10",
              error && "border-state-failed",
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-900/40 hover:text-ink-900"
            >
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs font-medium text-state-failed">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
