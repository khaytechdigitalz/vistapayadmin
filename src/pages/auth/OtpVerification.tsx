import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { verifyOtp, forgotPassword } from "@/api/auth";
import { AuthLayout } from "@/components/layout/AuthLayout";

const LENGTH = 6;

export const OtpVerification: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Safe Base64 decoding of email from query parameter
  const encodedEmail = searchParams.get("email") || "";
  let decodedEmail = "";
  try {
    decodedEmail = encodedEmail ? atob(decodeURIComponent(encodedEmail)) : "";
  } catch {
    decodedEmail = encodedEmail; // Fallback if unencoded
  }

  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [seconds, setSeconds] = useState(45);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input field on initial render
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // Countdown timer for code resend
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const executeVerification = async (otpCode: string) => {
    if (!decodedEmail) {
      toast.error("Email address missing. Please request a new code.");
      navigate("/forgot-password");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOtp({ email: decodedEmail, otp: otpCode });

      if (response.status) {
        toast.success(response.message || "OTP verified successfully!");

        // Base64 encode email and OTP for password reset step
        const encryptedEmail = btoa(decodedEmail);
        const encryptedOtp = btoa(otpCode);

        navigate(
          `/reset-password?email=${encodeURIComponent(
            encryptedEmail
          )}&otp=${encodeURIComponent(encryptedOtp)}`
        );
      } else {
        toast.error(response.message || "Invalid OTP code.");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Verification failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d+$/.test(value)) return;

    const next = [...digits];
    next[index] = value.slice(-1);
    setDigits(next);

    if (value && index < LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    const fullCode = next.join("");
    if (fullCode.length === LENGTH) {
      executeVerification(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    if (/^\d{6}$/.test(pastedData)) {
      const pastedDigits = pastedData.split("");
      setDigits(pastedDigits);
      inputsRef.current[LENGTH - 1]?.focus();
      executeVerification(pastedData);
    }
  };

  const handleResend = async () => {
    if (!decodedEmail) {
      toast.error("Email address missing. Please go back and restart.");
      navigate("/forgot-password");
      return;
    }

    setResending(true);
    try {
      const response = await forgotPassword(decodedEmail);
      if (response.status) {
        toast.success(response.message || "Reset code resent successfully!");
        setSeconds(45); // Reset timer
      } else {
        toast.error(response.message || "Failed to resend code.");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to resend code. Please try again.";
      toast.error(errorMsg);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < LENGTH) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }
    executeVerification(code);
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold text-ink-900">Enter Verification Code</h1>
      <p className="mt-2 text-sm text-ink-900/60">
        We sent a 6-digit code to{" "}
        <span className="font-semibold text-ink-900">
          {decodedEmail || "your email address"}
        </span>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex justify-between gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              inputMode="numeric"
              maxLength={1}
              disabled={loading}
              className="h-14 w-12 rounded-xl border border-surface-border text-center text-xl font-bold text-ink-900 outline-none transition-colors focus:border-ink-800 disabled:opacity-50"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || digits.join("").length < LENGTH}
          className="btn-primary mt-8 w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-900/60">
        {seconds > 0 ? (
          <>
            Resend code in <span className="font-semibold text-ink-900">{seconds}s</span>
          </>
        ) : (
          <button
            type="button"
            disabled={resending}
            onClick={handleResend}
            className="font-semibold text-ink-900 hover:underline disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend Code"}
          </button>
        )}
      </p>
    </AuthLayout>
  );
};