import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Copy, CreditCard, Loader2, Lock, Smartphone, Wallet } from "lucide-react";
import { Dropdown } from "@/components/ui/Dropdown";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { getVirtualAccount, generateVirtualAccountNumber } from "@/lib/virtualAccount";

type Method = "transfer" | "card" | "momo" | "ussd";

const methods: { key: Method; label: string; icon: typeof Building2 }[] = [
  { key: "transfer", label: "Bank Transfer", icon: Building2 },
  { key: "card", label: "Card", icon: CreditCard },
  { key: "momo", label: "MoMo", icon: Wallet },
  { key: "ussd", label: "USSD", icon: Smartphone },
];

const ussdBanks = [
  { value: "gtbank", label: "GTBank", sublabel: "*737#" },
  { value: "access", label: "Access Bank", sublabel: "*901#" },
  { value: "zenith", label: "Zenith Bank", sublabel: "*966#" },
  { value: "uba", label: "UBA", sublabel: "*919#" },
];

const momoProviders = [
  { value: "mtn-momo", label: "MTN MoMo" },
  { value: "airtel-money", label: "Airtel Money" },
  { value: "opay", label: "OPay" },
];

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { push } = useToast();
  const [method, setMethod] = useState<Method>("transfer");
  const [amount, setAmount] = useState("15000");
  const [virtualAccount, setVirtualAccount] = useState<string | null>(() => getVirtualAccount());

  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const [momoProvider, setMomoProvider] = useState(momoProviders[0].value);
  const [momoPhone, setMomoPhone] = useState("");

  const [ussdBank, setUssdBank] = useState(ussdBanks[0].value);

  const [paying, setPaying] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const ensureVirtualAccount = () => {
    if (!virtualAccount) setVirtualAccount(generateVirtualAccountNumber());
  };

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "card" && (!cardNumber || !cardExpiry || !cardCvv || !cardName)) {
      push("Fill in all card details", "error");
      return;
    }
    if (method === "momo" && !momoPhone) {
      push("Enter your mobile money number", "error");
      return;
    }
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setSuccessOpen(true);
    }, 1400);
  };

  const selectedUssd = ussdBanks.find((b) => b.value === ussdBank);

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-xl space-y-4">
        {/* Navigation Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-bold text-ink-900/60 hover:text-ink-900 transition"
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Main Centered Checkout Card */}
        <div className="card overflow-hidden !p-0 shadow-2xl border border-surface-border">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-5 sm:px-6 py-4 sm:py-5 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary-dark">
                <Wallet size={16} />
              </span>
              <span className="font-extrabold text-sm sm:text-base">VistaPay Checkout</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/70">
              <Lock size={12} /> Secured
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            {/* Amount Summary Box */}
            <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
              <span className="text-xs sm:text-sm font-semibold text-ink-900/60">Amount to pay</span>
              <span className="text-lg sm:text-2xl font-extrabold text-ink-900">{formatNaira(Number(amount) || 0)}</span>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {methods.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => {
                    setMethod(m.key);
                    if (m.key === "transfer") ensureVirtualAccount();
                  }}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 sm:py-4 text-xs font-semibold transition ${
                    method === m.key 
                      ? "border-primary bg-primary text-white shadow-sm" 
                      : "border-surface-border text-ink-900/70 hover:bg-surface-muted"
                  }`}
                >
                  <m.icon size={18} />
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Method Forms */}
            <form onSubmit={pay} className="space-y-5">
              {method === "transfer" && (
                <div className="rounded-xl border border-surface-border p-4 space-y-3">
                  <p className="text-sm font-semibold text-ink-900">Pay via bank transfer</p>
                  <p className="text-xs text-ink-900/50">Transfer the exact amount above to the account below. This checkout confirms automatically once received.</p>
                  <div className="flex flex-col gap-3 rounded-xl bg-surface-muted p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold text-ink-900/50">VistaPay MFB · Alesia Kirkland</p>
                      <p className="mt-1 font-mono text-base sm:text-lg font-extrabold tracking-widest text-ink-900">{virtualAccount ?? "Generating..."}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (virtualAccount) {
                          navigator.clipboard?.writeText(virtualAccount);
                          push("Account number copied", "info");
                        }
                      }}
                      className="btn-secondary py-2 text-xs shrink-0 flex items-center justify-center gap-1"
                    >
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                </div>
              )}

              {method === "card" && (
                <div className="space-y-4 rounded-xl border border-surface-border p-4">
                  <p className="text-sm font-semibold text-ink-900">Pay with debit / credit card</p>
                  <div>
                    <label className="label">Card number</label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      className="input-field"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Expiry</label>
                      <input value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/YY" className="input-field" />
                    </div>
                    <div>
                      <label className="label">CVV</label>
                      <input
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        placeholder="123"
                        className="input-field"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Name on card</label>
                    <input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Alesia Kirkland" className="input-field" />
                  </div>
                </div>
              )}

              {method === "momo" && (
                <div className="space-y-4 rounded-xl border border-surface-border p-4">
                  <p className="text-sm font-semibold text-ink-900">Pay with mobile money</p>
                  <Dropdown
                    label="Provider"
                    options={momoProviders}
                    value={momoProvider}
                    onChange={setMomoProvider}
                    searchPlaceholder="Search provider..."
                  />
                  <div>
                    <label className="label">Mobile money number</label>
                    <input
                      value={momoPhone}
                      onChange={(e) => setMomoPhone(e.target.value)}
                      placeholder="0801 234 5678"
                      className="input-field"
                    />
                  </div>
                  <p className="text-xs text-ink-900/50">You'll receive a prompt on your phone to approve this payment.</p>
                </div>
              )}

              {method === "ussd" && (
                <div className="space-y-4 rounded-xl border border-surface-border p-4">
                  <p className="text-sm font-semibold text-ink-900">Pay with USSD</p>
                  <Dropdown
                    label="Select your bank"
                    options={ussdBanks}
                    value={ussdBank}
                    onChange={setUssdBank}
                    searchPlaceholder="Search bank..."
                  />
                  <div className="rounded-xl bg-surface-muted p-4 text-center">
                    <p className="text-xs text-ink-900/50">Dial this code on the phone linked to your {selectedUssd?.label} account</p>
                    <p className="mt-2 text-2xl font-extrabold tracking-widest text-ink-900">{selectedUssd?.sublabel}</p>
                  </div>
                  <p className="text-xs text-ink-900/50">Follow the prompts on your phone to complete this payment.</p>
                </div>
              )}

              <button type="submit" disabled={paying} className="btn-primary w-full py-3">
                {paying ? <Loader2 size={16} className="animate-spin mx-auto" /> : `Pay ${formatNaira(Number(amount) || 0)}`}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Confirmation Modal */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)} title="Payment Successful" description="Your checkout has been completed.">
        <div className="rounded-xl bg-state-successbg p-5 text-center">
          <p className="text-2xl font-extrabold text-state-success">{formatNaira(Number(amount) || 0)}</p>
          <p className="mt-1 text-sm text-ink-900/60">paid via {methods.find((m) => m.key === method)?.label}</p>
        </div>
        <button className="btn-primary mt-6 w-full py-3 font-bold" onClick={() => navigate("/app/dashboard")}>
          Back to Dashboard
        </button>
      </Modal>
    </div>
  );
};