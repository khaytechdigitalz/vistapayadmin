import React, { useState } from "react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PinModal } from "@/components/ui/PinModal";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";

export interface BillProvider {
  value: string;
  label: string;
  sublabel?: string;
}

interface BillFormProps {
  title: string;
  description: string;
  providers: BillProvider[];
  identifierLabel: string;
  identifierPlaceholder: string;
  quickAmounts?: number[];
  showPackage?: boolean;
  packages?: { value: string; label: string; sublabel?: string }[];
  accentIcon: React.ReactNode;
  recentLabel: string;
}

export const BillForm: React.FC<BillFormProps> = ({
  title,
  description,
  providers,
  identifierLabel,
  identifierPlaceholder,
  quickAmounts = [500, 1000, 2000, 5000],
  showPackage = false,
  packages = [],
  accentIcon,
  recentLabel,
}) => {
  const [provider, setProvider] = useState(providers[0]?.value ?? "");
  const [pkg, setPkg] = useState(packages[0]?.value ?? "");
  const [identifier, setIdentifier] = useState("");
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const { push } = useToast();

  const providerLabel = providers.find((p) => p.value === provider)?.label ?? "";
  const packageLabel = packages.find((p) => p.value === pkg)?.label;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || (!showPackage && !amount)) {
      push("Fill in the required fields", "error");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    setPinOpen(true);
  };

  const handlePinSuccess = () => {
    setPinOpen(false);
    push(`${providerLabel} payment successful`, "success");
    setIdentifier("");
    setAmount("");
  };

  const effectiveAmount = showPackage ? packages.find((p) => p.value === pkg)?.sublabel ?? "0" : amount;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <div className="mb-6 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl widget-primary text-primary">
            {accentIcon}
          </span>
          <div>
            <h3 className="font-bold text-ink-900">{title}</h3>
            <p className="text-sm text-ink-900/50">{description}</p>
          </div>
        </div>

        <form onSubmit={handlePay} className="space-y-5">
          <Dropdown
            label="Provider"
            options={providers.map((p) => ({ value: p.value, label: p.label, sublabel: p.sublabel }))}
            value={provider}
            onChange={setProvider}
            searchPlaceholder="Search provider..."
          />

          <Input
            label={identifierLabel}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder={identifierPlaceholder}
            required
          />

          {showPackage && (
            <Dropdown
              label="Package"
              options={packages}
              value={pkg}
              onChange={setPkg}
              searchPlaceholder="Search package..."
            />
          )}

          {!showPackage && (
            <div>
              <label className="label">Amount</label>
              <div className="mb-2 flex flex-wrap gap-2">
                {quickAmounts.map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                      amount === String(a)
                        ? "border-primary bg-primary-50 text-primary"
                        : "border-surface-border text-ink-900/70 hover:bg-surface-muted"
                    }`}
                  >
                    {formatNaira(a)}
                  </button>
                ))}
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                icon={<span className="text-sm font-semibold">₦</span>}
              />
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            Continue
          </button>
        </form>
      </div>

      <div className="space-y-5">
        <div className="card bg-primary text-white">
          <h3 className="mb-2 font-bold">Auto-Pay</h3>
          <p className="mb-4 text-sm text-white/60">Never miss a due date — schedule this bill to pay automatically.</p>
          <button className="btn-secondary w-full !bg-white/10 !text-white !border-white/20">Set Up Auto-Pay</button>
        </div>
        <div className="card">
          <h3 className="mb-4 font-bold text-ink-900">{recentLabel}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-900/70">{providerLabel || providers[0]?.label}</span>
              <span className="font-semibold text-ink-900">{formatNaira(quickAmounts[1] ?? 1000)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-900/70">{providers[1]?.label ?? providers[0]?.label}</span>
              <span className="font-semibold text-ink-900">{formatNaira(quickAmounts[0] ?? 500)}</span>
            </div>
          </div>
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Payment" description="Double-check the details before you pay.">
        <div className="space-y-3 rounded-xl bg-surface-muted p-4 text-sm">
          <div className="flex justify-between"><span className="text-ink-900/50">Provider</span><span className="font-semibold text-ink-900">{providerLabel}</span></div>
          <div className="flex justify-between"><span className="text-ink-900/50">{identifierLabel}</span><span className="font-semibold text-ink-900">{identifier}</span></div>
          {showPackage && packageLabel && (
            <div className="flex justify-between"><span className="text-ink-900/50">Package</span><span className="font-semibold text-ink-900">{packageLabel}</span></div>
          )}
          <div className="flex justify-between"><span className="text-ink-900/50">Amount</span><span className="font-bold text-ink-900">{formatNaira(Number(effectiveAmount) || 0)}</span></div>
        </div>
        <div className="mt-6 flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => setConfirmOpen(false)}>Cancel</button>
          <button className="btn-primary flex-1" onClick={handleConfirm}>Pay Now</button>
        </div>
      </Modal>

      <PinModal
        open={pinOpen}
        onClose={() => setPinOpen(false)}
        onSuccess={handlePinSuccess}
        length={4}
        title="Enter Transaction PIN"
        description={`Confirm this ${formatNaira(Number(effectiveAmount) || 0)} payment with your 4-digit PIN.`}
      />
    </div>
  );
};
