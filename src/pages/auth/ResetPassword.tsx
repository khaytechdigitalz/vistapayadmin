import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Check, X } from "lucide-react";
import { toast } from "sonner";
import { resetPassword } from "@/api/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Decode email and OTP from URL search parameters
  const encodedEmail = searchParams.get("email") || "";
  const encodedOtp = searchParams.get("otp") || "";

  let email = "";
  let otp = "";

  try {
    email = encodedEmail ? atob(decodeURIComponent(encodedEmail)) : "";
  } catch {
    email = encodedEmail; // Fallback
  }

  try {
    otp = encodedOtp ? atob(decodeURIComponent(encodedOtp)) : "";
  } catch {
    otp = encodedOtp; // Fallback
  }

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Validation Rule Checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  const isPasswordValid =
    hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol;
  const passwordsMatch =
    passwordConfirmation.length > 0 && password === passwordConfirmation;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Missing verification details. Please restart the process.");
      navigate("/forgot-password");
      return;
    }

    if (!isPasswordValid) {
      toast.error("Please meet all password requirements.");
      return;
    }

    if (password !== passwordConfirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });

      if (response.status) {
        toast.success(response.message || "Password reset successfully!");
        navigate("/login", { state: { success: true } });
      } else {
        toast.error(response.message || "Failed to reset password.");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold text-ink-900">Set A New Password</h1>
      <p className="mt-2 text-sm text-ink-900/60">
        Make it something strong that you haven't used before.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <Input
            label="New password"
            type="password"
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            required
          />

          {password.length > 0 && (
            <div className="mt-2 space-y-1 text-xs">
              <RuleItem label="At least 8 characters" valid={hasMinLength} />
              <RuleItem label="Contains uppercase letter" valid={hasUpper} />
              <RuleItem label="Contains lowercase letter" valid={hasLower} />
              <RuleItem label="Contains number" valid={hasNumber} />
              <RuleItem label="Contains special symbol" valid={hasSymbol} />
            </div>
          )}
        </div>

        <div>
          <Input
            label="Confirm new password"
            type="password"
            icon={<Lock size={16} />}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            placeholder="Re-enter your new password"
            required
          />

          {passwordConfirmation.length > 0 && (
            <p
              className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
                passwordsMatch ? "text-state-success" : "text-state-failed"
              }`}
            >
              {passwordsMatch ? <Check size={12} /> : <X size={12} />}
              {passwordsMatch ? "Passwords match" : "Passwords do not match"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid || !passwordsMatch}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>
    </AuthLayout>
  );
};

// Sub-component for individual rule items
const RuleItem: React.FC<{ label: string; valid: boolean }> = ({ label, valid }) => (
  <p
    className={`flex items-center gap-1.5 font-medium transition-colors ${
      valid ? "text-state-success" : "text-ink-900/40"
    }`}
  >
    {valid ? <Check size={12} /> : <X size={12} />}
    {label}
  </p>
);