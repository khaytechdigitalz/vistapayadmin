import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/axios";
import { formatNaira } from "@/lib/currency";

export const DepositCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("Verifying payment status...");
  const [amount, setAmount] = useState<number>(0);
  const [reference, setReference] = useState<string>("");

  useEffect(() => {
    verifyDeposit();
  }, []);

  const verifyDeposit = async () => {
    try {
      setLoading(true);

      // Extract all search params into plain object
      const params = Object.fromEntries(searchParams.entries());

      const res = await apiClient.post("/vservices/deposit/verify-callback", params);

      if (res.data.status) {
        setSuccess(true);
        setMessage(res.data.message || "Wallet funded successfully!");
        if (res.data.amount) setAmount(res.data.amount);
        if (res.data.reference) setReference(res.data.reference);
      } else {
        setSuccess(false);
        setMessage(res.data.message || "Payment verification failed.");
      }
    } catch (err: any) {
      setSuccess(false);
      setMessage(err?.response?.data?.message || "Unable to verify transaction payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="card max-w-md w-full text-center space-y-5 p-8 shadow-xl">
        {loading ? (
          <div className="py-8 space-y-4">
            <Loader2 size={48} className="animate-spin text-primary mx-auto" />
            <h3 className="text-lg font-bold text-ink-900">Confirming Payment</h3>
            <p className="text-xs text-ink-900/50">Please do not refresh this page while we verify with the gateway...</p>
          </div>
        ) : success ? (
          <div className="py-4 space-y-4">
            <CheckCircle2 size={56} className="text-state-success mx-auto" />
            <h3 className="text-xl font-extrabold text-ink-900">Deposit Successful!</h3>
            {amount > 0 && <p className="text-3xl font-extrabold text-primary">{formatNaira(amount)}</p>}
            <p className="text-xs text-ink-900/60 font-medium">{message}</p>
            {reference && <p className="text-[11px] font-mono bg-surface-muted py-1.5 px-3 rounded-lg text-ink-900/70">Ref: {reference}</p>}

            <button onClick={() => navigate("/app/dashboard")} className="btn-primary w-full mt-4">
              Return to Dashboard <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <XCircle size={56} className="text-state-error mx-auto" />
            <h3 className="text-xl font-extrabold text-ink-900">Verification Failed</h3>
            <p className="text-xs text-state-error font-semibold">{message}</p>

            <button onClick={() => navigate("/dashboard/deposit")} className="btn-secondary w-full mt-4">
              Try Deposit Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};