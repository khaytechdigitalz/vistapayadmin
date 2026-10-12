import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { toast } from "sonner";
import { loginUser } from "@/api/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  
  const { handleLoginSuccess, setTempToken, setRequires2fa } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          } else {
            toast.error("Missing verification token from server.");
          }
        } else {
          if (token) {
            await handleLoginSuccess(token);
            toast.success(response.message || "Welcome back!");
            navigate("/app/dashboard");
          } else {
            toast.error("Authentication token missing in response.");
          }
        }
      } else {
        toast.error(response.message || "Invalid credentials.");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to sign in. Please check your details.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
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