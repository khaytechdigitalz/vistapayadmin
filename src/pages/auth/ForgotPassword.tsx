import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword } from "@/api/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(email);

      if (response.status) {
        toast.success(response.message || "Reset code sent successfully!");
        // Base64 encode the email for the URL query parameter
        const encodedEmail = btoa(email);
        navigate(`/verify-otp?email=${encodeURIComponent(encodedEmail)}`);
      } else {
        toast.error(response.message || "Failed to send reset code.");
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
      <Link
        to="/login"
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-900/60 transition-colors hover:text-ink-900"
      >
        <ArrowLeft size={14} /> Back to log in
      </Link>

      <h1 className="text-2xl font-extrabold text-ink-900">Forgot Password?</h1>
      <p className="mt-2 text-sm text-ink-900/60">
        Enter the email linked to your account and we'll send you a verification code.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Input
          label="Email address"
          type="email"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending code..." : "Send Reset Code"}
        </button>
      </form>
    </AuthLayout>
  );
};