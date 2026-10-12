import React, { useEffect, useState } from "react";
import { Lock, ShieldCheck, Smartphone, Copy, Monitor, KeyRound, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { SettingsNav } from "./SettingsNav";
import {
  changePassword,
  changePin,
  fetchTwoFactorStatus,
  enableTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
} from "@/api/admin";
import QRCode from "react-qr-code";
 

export const SecuritySettings: React.FC = () => {
  const { user } = useAuth();
  const { push } = useToast();

  // Password States
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  // 2FA States
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [loading2FA, setLoading2FA] = useState(true);
  const [loading2FASetup, setLoading2FASetup] = useState(false);
  const [loading2FAConfirm, setLoading2FAConfirm] = useState(false);
  const [loading2FADisable, setLoading2FADisable] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");

  // Transaction PIN States
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPinVal, setConfirmPinVal] = useState("");
  const [loadingPin, setLoadingPin] = useState(false);

  const hasTransactionPin = user?.hasTransactionPin ?? false;

  useEffect(() => {
    load2FAStatus();
  }, []);

  const load2FAStatus = async () => {
    try {
      setLoading2FA(true);
      const res = await fetchTwoFactorStatus();
      if (res.status) {
        setIs2FAEnabled(Boolean(res.data?.google2fa_enabled));
      }
    } catch (error) {
      console.error("Failed to fetch 2FA status", error);
    } finally {
      setLoading2FA(false);
    }
  };

  // 1. Password Update
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      push("New password and confirmation do not match", "error");
      return;
    }
    if (newPw.length < 8) {
      push("Password must be at least 8 characters", "error");
      return;
    }

    try {
      setLoadingPassword(true);
      const res = await changePassword({
        current_password: currentPw,
        password: newPw,
        password_confirmation: confirmPw,
      });

      if (res.status) {
        push(res.message || "Password updated successfully", "success");
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to update password.";
      push(msg, "error");
    } finally {
      setLoadingPassword(false);
    }
  };

  // 2. Transaction PIN Update
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4 || pin !== confirmPinVal) {
      push("Please enter a matching 4-digit PIN", "error");
      return;
    }

    try {
      setLoadingPin(true);
      const res = await changePin({
        pin,
        pin_confirmation: confirmPinVal,
      });

      if (res.status) {
        push(res.message || "Transaction PIN saved successfully", "success");
        setPinOpen(false);
        setPin("");
        setConfirmPinVal("");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to save transaction PIN.";
      push(msg, "error");
    } finally {
      setLoadingPin(false);
    }
  };

  // 3. Initiate 2FA Setup
  const handleStart2FASetup = async () => {
    try {
      setLoading2FASetup(true);
      const res = await enableTwoFactor();
      if (res.status && res.data) {
        setSecretKey(res.data.secret || "");
        setQrCodeUrl(res.data.qr_code_url || res.data.inline_svg || "");
        setSetupOpen(true);
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to initiate 2FA setup.";
      push(msg, "error");
    } finally {
      setLoading2FASetup(false);
    }
  };

  // 4. Confirm & Enable 2FA
  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      push("Enter the 6-digit code from Google Authenticator", "error");
      return;
    }

    try {
      setLoading2FAConfirm(true);
      const res = await confirmTwoFactor(code);
      if (res.status) {
        push("Google Authenticator 2FA enabled successfully", "success");
        setIs2FAEnabled(true);
        setSetupOpen(false);
        setCode("");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Invalid 2FA code.";
      push(msg, "error");
    } finally {
      setLoading2FAConfirm(false);
    }
  };

  // 5. Disable 2FA
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disableCode.length !== 6) {
      push("Enter a valid 6-digit 2FA code", "error");
      return;
    }

    try {
      setLoading2FADisable(true);
      const res = await disableTwoFactor(disableCode);
      if (res.status) {
        push("2FA disabled successfully", "info");
        setIs2FAEnabled(false);
        setDisableOpen(false);
        setDisableCode("");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Failed to disable 2FA.";
      push(msg, "error");
    } finally {
      setLoading2FADisable(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
      <SettingsNav />

      <div className="space-y-5">
        {/* Password Card */}
        <div className="card">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-primary">
              <Lock size={16} />
            </span>
            <h3 className="font-bold text-ink-900">Password</h3>
          </div>
          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            <Input
              label="Current password"
              type="password"
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              required
            />
            <Input
              label="New password"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loadingPassword}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loadingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              {loadingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Transaction PIN Card */}
        <div className="card">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-primary">
                <KeyRound size={16} />
              </span>
              <div>
                <h3 className="font-bold text-ink-900">Transaction PIN</h3>
                <p className="text-xs text-ink-900/50">
                  A 4-digit PIN required to authorize transfers and bill payments.
                </p>
              </div>
            </div>
            <span
              className={`pill ${
                hasTransactionPin
                  ? "bg-state-successbg text-state-success"
                  : "bg-surface-muted text-ink-900/50"
              }`}
            >
              {hasTransactionPin ? "Active" : "Not set"}
            </span>
          </div>

          {hasTransactionPin && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-state-successbg px-4 py-2.5 text-sm font-medium text-state-success">
              <CheckCircle2 size={16} /> Your transaction PIN is active and required for every transfer or bill payment.
            </div>
          )}

          <button onClick={() => setPinOpen(true)} className="btn-primary flex items-center gap-2">
            <KeyRound size={16} />
            {hasTransactionPin ? "Change Transaction PIN" : "Set Up Transaction PIN"}
          </button>
        </div>

        {/* Google 2FA Card */}
        <div className="card">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-primary">
                <ShieldCheck size={16} />
              </span>
              <div>
                <h3 className="font-bold text-ink-900">Google Authenticator (2FA)</h3>
                <p className="text-xs text-ink-900/50">Add an extra layer of security to your account.</p>
              </div>
            </div>

            {loading2FA ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <span
                className={`pill ${
                  is2FAEnabled
                    ? "bg-state-successbg text-state-success"
                    : "bg-surface-muted text-ink-900/50"
                }`}
              >
                {is2FAEnabled ? "Enabled" : "Disabled"}
              </span>
            )}
          </div>

          {is2FAEnabled ? (
            <button
              onClick={() => setDisableOpen(true)}
              className="btn-secondary"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={handleStart2FASetup}
              disabled={loading2FASetup}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {loading2FASetup ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Smartphone size={16} />
              )}
              {loading2FASetup ? "Generating QR Code..." : "Set Up Google 2FA"}
            </button>
          )}
        </div>

       
      </div>

      {/* 2FA Setup Modal */}
      <Modal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        title="Set Up Google Authenticator"
        description="Scan the QR code with Google Authenticator, then enter the code it generates."
      >
        <div className="mb-5 flex flex-col items-center gap-3">
        <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-white p-3">
  {qrCodeUrl ? (
    qrCodeUrl.startsWith("http") || qrCodeUrl.startsWith("data:") ? (
      <img src={qrCodeUrl} alt="2FA QR Code" className="h-full w-full object-contain" />
    ) : qrCodeUrl.includes("<svg") || qrCodeUrl.includes("<?xml") ? (
      <div
        dangerouslySetInnerHTML={{ __html: qrCodeUrl }}
        className="h-full w-full flex items-center justify-center [&>svg]:h-full [&>svg]:w-full"
      />
    ) : (
      /* Handles otpauth:// URIs or plain strings */
      <QRCode value={qrCodeUrl} size={160} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
    )
  ) : (
    <div className="text-xs text-ink-900/40">No QR image</div>
  )}
</div>

          {secretKey && (
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(secretKey);
                push("Secret key copied to clipboard", "info");
              }}
              className="flex items-center gap-1.5 rounded-lg bg-surface-muted px-3 py-2 text-xs font-semibold text-ink-900 hover:bg-surface-border/40"
            >
              <Copy size={13} /> {secretKey}
            </button>
          )}
        </div>

        <form onSubmit={handleConfirm2FA} className="space-y-4">
          <Input
            label="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            required
          />
          <button
            type="submit"
            disabled={loading2FAConfirm}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading2FAConfirm && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading2FAConfirm ? "Verifying..." : "Verify & Enable"}
          </button>
        </form>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal
        open={disableOpen}
        onClose={() => setDisableOpen(false)}
        title="Disable Google Authenticator"
        description="Enter a 6-digit code from Google Authenticator to confirm disabling 2FA."
      >
        <form onSubmit={handleDisable2FA} className="space-y-4">
          <Input
            label="Enter 6-digit code"
            value={disableCode}
            onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            required
          />
          <button
            type="submit"
            disabled={loading2FADisable}
            className="btn-danger w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading2FADisable && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading2FADisable ? "Disabling..." : "Confirm & Disable 2FA"}
          </button>
        </form>
      </Modal>

      {/* Set / Change Transaction PIN Modal */}
      <Modal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        title={hasTransactionPin ? "Change Transaction PIN" : "Set Up Transaction PIN"}
        description="Choose a 4-digit PIN you'll use to authorize transfers and bill payments."
      >
        <form onSubmit={handleSavePin} className="space-y-4">
          <Input
            label="4-Digit PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            inputMode="numeric"
            required
          />
          <Input
            label="Confirm PIN"
            type="password"
            value={confirmPinVal}
            onChange={(e) => setConfirmPinVal(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="••••"
            inputMode="numeric"
            required
          />
          <button
            type="submit"
            disabled={loadingPin}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loadingPin && <Loader2 className="h-4 w-4 animate-spin" />}
            {loadingPin ? "Saving PIN..." : "Save PIN"}
          </button>
        </form>
      </Modal>
    </div>
  );
};