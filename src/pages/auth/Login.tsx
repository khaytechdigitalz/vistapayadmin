import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/api/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

// Set to false to turn the automatic demo login off.
const AUTO_DEMO_LOGIN = true;
const COUNTDOWN_SECONDS = 3;

export const Login: React.FC = () => {
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);

  // Demo auto-login modal state
  const [showDemoModal, setShowDemoModal] = useState(AUTO_DEMO_LOGIN);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const autoLoginStarted = useRef(false);

  const { handleLoginSuccess, setTempToken, setRequires2fa } = useAuth();
  const navigate = useNavigate();

  // Shared by the form and the auto-login. Returns true when the attempt finished without error.
  const performLogin = async (): Promise<boolean> => {
    setLoading(true);

    try {
      const response = await loginUser({ email, password });

      if (response.status) {
        const token = response.data?.token || response.token;

        if (response.requires_2fa) {
          if (token) {
            // Store temporary token for 2FA verification step
            setTempToken?.(token);
            setRequires2fa?.(true);
            toast.info(response.message || "Please provide your 2FA code.");

            // Navigate to OTP page with state context
            navigate("/two-factor/authentication", { state: { purpose: "2fa", tempToken: token } });
            return true;
          }
          toast.error("Missing verification token from server.");
          return false;
        }

        if (token) {
          await handleLoginSuccess(token);
          toast.success(response.message || "Welcome back!");
          navigate("/app/dashboard");
          return true;
        }
        toast.error("Authentication token missing in response.");
        return false;
      }

      toast.error(response.message || "Invalid credentials.");
      return false;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to sign in. Please check your details.";
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await performLogin();
  };

  // Tick the countdown down once per second while the modal is open.
  useEffect(() => {
    if (!showDemoModal || countdown <= 0) return;

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showDemoModal, countdown]);

  // When the countdown reaches zero, submit the form values in the background (once only).
  useEffect(() => {
    if (!showDemoModal || countdown > 0 || autoLoginStarted.current) return;
    autoLoginStarted.current = true;

    performLogin().then((ok) => {
      // On success we navigate away. On failure, close the modal so the form can be used.
      if (!ok) setShowDemoModal(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDemoModal, countdown]);

  const cancelAutoLogin = () => {
    setShowDemoModal(false);
    autoLoginStarted.current = true; // make sure it never fires after cancelling
  };

  return (
    <AuthLayout>
      {/* Demo admin account modal */}
      {showDemoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-login-title"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {countdown > 0 ? (
                <span className="text-3xl font-extrabold text-primary" aria-live="polite">
                  {countdown}
                </span>
              ) : (
                <Loader2 className="animate-spin text-primary" size={28} />
              )}
            </div>

            <h2 id="demo-login-title" className="mt-4 text-lg font-extrabold text-ink-900">
              {countdown > 0 ? "Logging you in to the demo admin account" : "Signing you in..."}
            </h2>
            <p className="mt-2 text-sm text-ink-900/60">
              {countdown > 0
                ? `You will now be logged in to the demo admin account in ${countdown} second${
                    countdown === 1 ? "" : "s"
                  }.`
                : "Hang tight while we open the admin dashboard."}
            </p>

            {countdown > 0 && (
              <button
                type="button"
                onClick={cancelAutoLogin}
                className="mt-5 text-xs font-semibold text-ink-900/60 hover:text-ink-900 hover:underline"
              >
                Use my own account instead
              </button>
            )}
          </div>
        </div>
      )}

      <h1 className="text-2xl font-extrabold text-ink-900">Log In To Admin Account</h1>
      <p className="mt-2 text-sm text-ink-900/60">
        Welcome back — enter your details to access your account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          icon={<Mail size={16} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
        />
        <Input
          label="Password"
          type="password"
          icon={<Lock size={16} />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••••"
          required
        />
        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>
    </AuthLayout>
  );
};
