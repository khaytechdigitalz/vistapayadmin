import React, { useState, useEffect } from "react";
import { 
  Download, 
  Send, 
  Copy, 
  RefreshCcw, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  ArrowRightLeft,
  Coins
} from "lucide-react";
import { 
  fetchUserWallets, 
  createCryptoAddress, 
  getCoinBalance, 
  estimateWithdrawalCost, 
  withdrawCrypto 
} from "../api/crypto";
import { SupportedCoin, CryptoWallet, WithdrawalSpeed } from "../types/crypto";
import { useToast } from "@/context/ToastContext";

const COINS: { code: SupportedCoin; name: string; icon: string }[] = [
  { code: "USDTTRC20", name: "Tether (TRC20)", icon: "💎" },
  { code: "BTC", name: "Bitcoin", icon: "₿" },
  { code: "ETH", name: "Ethereum", icon: "Ξ" },
  { code: "LTC", name: "Litecoin", icon: "Ł" },
  { code: "DOGE", name: "Dogecoin", icon: "Ð" },
  { code: "BNB", name: "Binance Coin", icon: "B" },
  { code: "TCN", name: "Test Coin", icon: "Ť" },
];

export const Wallets: React.FC = () => {
  const [wallets, setWallets] = useState<CryptoWallet[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<SupportedCoin>("USDTTRC20");
  const [coinBalance, setCoinBalance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);

  // Withdrawal state
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawSpeed, setWithdrawSpeed] = useState<WithdrawalSpeed>("medium");
  const [estimatedFee, setEstimatedFee] = useState<string | null>(null);

  const { push } = useToast();

  useEffect(() => {
    loadWallets();
  }, []);

  useEffect(() => {
    loadBalance(selectedCoin);
  }, [selectedCoin]);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const res = await fetchUserWallets();
      if (res.status) {
        setWallets(res.data);
      }
    } catch (err: any) {
      push(err.response?.data?.message || "Failed to load crypto wallets.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async (coin: SupportedCoin) => {
    try {
      const res = await getCoinBalance(coin);
      if (res.status) {
        setCoinBalance(res.data);
      }
    } catch (err) {
      setCoinBalance(null);
    }
  };

  const handleCreateAddress = async () => {
    try {
      setGenerating(true);
      const res = await createCryptoAddress(selectedCoin);
      if (res.status) {
        push(`Successfully generated ${selectedCoin} wallet address`, "success");
        loadWallets();
        loadBalance(selectedCoin);
      }
    } catch (err: any) {
      push(err.response?.data?.message || "Failed to generate wallet address.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard?.writeText(address);
    push("Wallet address copied to clipboard", "info");
  };

  const handleEstimate = async () => {
    if (!withdrawAddress || !withdrawAmount) return;
    try {
      const res = await estimateWithdrawalCost(
        selectedCoin,
        withdrawAddress,
        parseFloat(withdrawAmount),
        withdrawSpeed
      );
      if (res.status) {
        setEstimatedFee(res.data.total_fee);
      }
    } catch (err: any) {
      push(err.response?.data?.message || "Failed to calculate network fees.", "error");
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const idempotencyKey = `crypto_wd_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const res = await withdrawCrypto(
        idempotencyKey,
        selectedCoin,
        withdrawAddress,
        parseFloat(withdrawAmount),
        withdrawSpeed
      );

      if (res.status) {
        push(res.message || "Crypto withdrawal processed successfully!", "success");
        setWithdrawAddress("");
        setWithdrawAmount("");
        setEstimatedFee(null);
        loadBalance(selectedCoin);
      }
    } catch (err: any) {
      push(err.response?.data?.message || "Crypto withdrawal failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const currentWallet = wallets.find((w) => w.coin === selectedCoin);
  const activeCoinMeta = COINS.find((c) => c.code === selectedCoin);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
      {/* Left Main Column */}
      <div className="space-y-5 xl:col-span-2">
        {/* Balance Card */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-ink-900/50">Vault Balance ({selectedCoin})</p>
              <p className="text-2xl font-extrabold text-ink-900">
                {coinBalance?.balance ?? "0.00000000"} <span className="text-sm font-semibold text-ink-900/40">{selectedCoin}</span>
              </p>
              <p className="mt-1 text-xs font-semibold text-state-success flex items-center gap-1">
                <ShieldCheck size={14} /> Secured via CoinRemitter Vault
              </p>
            </div>
            <div className="flex gap-1.5 overflow-x-auto py-1">
              {COINS.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setSelectedCoin(c.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedCoin === c.code
                      ? "bg-primary text-secondary shadow-sm"
                      : "bg-surface-muted text-ink-900/70 hover:bg-surface-border"
                  }`}
                >
                  {c.icon} {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Deposit Address Widget */}
        <div className="card widget-primary">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-secondary">
              <QrCode size={18} />
            </span>
            <div>
              <h3 className="font-bold text-ink-900">{activeCoinMeta?.name} Deposit Address</h3>
              <p className="text-sm text-ink-900/50">Send only {selectedCoin} to this address to fund your vault automatically.</p>
            </div>
          </div>

          {currentWallet ? (
            <div className="flex flex-col gap-4 rounded-xl border border-primary/15 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-ink-900/50">Minimum Deposit: {currentWallet.minimum_deposit} {selectedCoin}</p>
                <p className="mt-1 font-mono text-sm font-bold tracking-wider text-ink-900 truncate">{currentWallet.address}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => copyAddress(currentWallet.address)} className="btn-secondary py-2 text-xs">
                  <Copy size={14} /> Copy
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleCreateAddress} disabled={generating} className="btn-primary w-full sm:w-auto">
              {generating ? "Generating Address..." : `Generate ${selectedCoin} Deposit Address`}
            </button>
          )}
        </div>

        {/* Withdrawal Form Card */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink-900 flex items-center gap-2">
              <Send size={16} /> Withdraw {selectedCoin}
            </h3>
            <span className="text-xs font-semibold text-ink-900/50">Deducted from Fiat Wallet</span>
          </div>

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-ink-900/60 mb-1">Recipient Address</label>
              <input
                type="text"
                required
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                onBlur={handleEstimate}
                placeholder={`Enter destination ${selectedCoin} address`}
                className="input-field font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink-900/60 mb-1">Amount ({selectedCoin})</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  onBlur={handleEstimate}
                  placeholder="0.00"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-900/60 mb-1">Withdrawal Speed</label>
                <select
                  value={withdrawSpeed}
                  onChange={(e) => {
                    setWithdrawSpeed(e.target.value as WithdrawalSpeed);
                    handleEstimate();
                  }}
                  className="input-field"
                >
                  <option value="low">Low Speed (Economy Fee)</option>
                  <option value="medium">Medium Speed (Standard)</option>
                  <option value="priority">Priority Speed (Fastest)</option>
                </select>
              </div>
            </div>

            {estimatedFee && (
              <div className="p-3 bg-surface-muted rounded-xl text-xs font-medium text-ink-900/70 flex justify-between items-center">
                <span>Estimated Blockchain Fee:</span>
                <span className="font-bold text-ink-900">{estimatedFee} {selectedCoin}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Processing Withdrawal..." : `Confirm & Send ${selectedCoin}`}
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar Column */}
      <div className="space-y-5">
        {/* Quick Info Card */}
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-ink-900 flex items-center gap-2">
              <Coins size={16} /> Active Vaults
            </h3>
            <span className="text-xs font-bold text-primary">{wallets.length} Connected</span>
          </div>
          <div className="space-y-3">
            {COINS.map((c) => {
              const matched = wallets.find((w) => w.coin === c.code);
              return (
                <div key={c.code} className="flex items-center justify-between p-3 rounded-xl border border-surface-border bg-surface-muted/30">
                  <span className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                    <span className="text-lg">{c.icon}</span> {c.code}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${matched ? "bg-state-success/10 text-state-success" : "bg-surface-border text-ink-900/50"}`}>
                    {matched ? "Active" : "Not Generated"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security Notice Card */}
        <div className="card bg-slate-900 text-white">
          <div className="flex items-center gap-3 mb-3">
            <span className="p-2 rounded-xl bg-white/10 text-primary">
              <Sparkles size={20} />
            </span>
            <h4 className="font-bold">Instant Gateway Security</h4>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">
            All crypto withdrawals are protected with idempotency keys and atomic locking against your internal fiat balances. Real-time webhook notifications update transaction statuses instantly.
          </p>
        </div>
      </div>
    </div>
  );
};