import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Upload, CheckCircle2, Gift } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { fetchGiftcardDetails, buyGiftcard, sellGiftcard, Giftcard } from "@/api/giftcard";

export const GiftcardTradeAction: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const initialAction = searchParams.get("action") === "sell" ? "sell" : "buy";

  const navigate = useNavigate();
  const { push } = useToast();

  const [card, setCard] = useState<Giftcard | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<"buy" | "sell">(initialAction);

  // Form states
  const [amount, setAmount] = useState("");
  const [cardType, setCardType] = useState<"physical" | "digital">("digital");
  const [cardNumber, setCardNumber] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  useEffect(() => {
    if (id) loadCard(id);
  }, [id]);

  const loadCard = async (cardId: string) => {
    try {
      setLoading(true);
      const res = await fetchGiftcardDetails(cardId);
      if (res.status && res.data) {
        setCard(res.data.giftcard);
      }
    } catch (err: any) {
      push("Failed to load giftcard details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      push("Enter a valid amount", "error");
      return;
    }

    try {
      setSubmitting(true);
      if (action === "buy") {
        const res = await buyGiftcard({ giftcard_id: card!.id, amount: Number(amount) });
        if (res.status) {
          push("Giftcard purchased successfully!", "success");
          navigate("/app/giftcards");
        }
      } else {
        const formData = new FormData();
        formData.append("giftcard_id", String(card!.id));
        formData.append("card_type", cardType);
        formData.append("amount", amount);
        if (cardType === "digital") {
          formData.append("card_number", cardNumber);
        } else {
          if (frontImage) formData.append("card_image_front", frontImage);
          if (backImage) formData.append("card_image_back", backImage);
        }

        const res = await sellGiftcard(formData);
        if (res.status) {
          push("Giftcard sell order submitted successfully!", "success");
          navigate("/app/giftcards");
        }
      }
    } catch (err: any) {
      push(err.response?.data?.message || "Trade transaction failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !card) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeRate = action === "buy" ? card.buy_rate : card.sell_rate;
  const calculatedTotal = (Number(amount) || 0) * activeRate;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-ink-900/60 hover:text-ink-900 transition"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      <div className="card space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Gift size={20} />
            </span>
            <div>
              <h3 className="font-bold text-ink-900 text-lg">{card.name}</h3>
              <p className="text-xs text-ink-900/50">Rate: {formatNaira(activeRate)} / {card.currency}</p>
            </div>
          </div>
          <div className="flex rounded-xl bg-surface-muted p-1">
            <button
              type="button"
              onClick={() => setAction("buy")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${action === "buy" ? "bg-primary text-white shadow-sm" : "text-ink-900/60 hover:text-ink-900"}`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setAction("sell")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${action === "sell" ? "bg-primary text-white shadow-sm" : "text-ink-900/60 hover:text-ink-900"}`}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Trade Form */}
        <form onSubmit={handleTrade} className="space-y-4">
          <div>
            <label className="label">Amount ({card.currency})</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 100"
              className="input-field"
              required
            />
          </div>

          {action === "sell" && (
            <>
              <div>
                <label className="label">Card Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardType("digital")}
                    className={`rounded-xl border p-3 text-xs font-semibold transition ${cardType === "digital" ? "border-primary bg-primary/5 text-primary" : "border-surface-border text-ink-900/70"}`}
                  >
                    Digital Code
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType("physical")}
                    className={`rounded-xl border p-3 text-xs font-semibold transition ${cardType === "physical" ? "border-primary bg-primary/5 text-primary" : "border-surface-border text-ink-900/70"}`}
                  >
                    Physical Card (Images)
                  </button>
                </div>
              </div>

              {cardType === "digital" ? (
                <div>
                  <label className="label">Card Number / Code</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Enter e-code or card number"
                    className="input-field font-mono"
                    required
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="label">Card Image (Front View)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
                      className="input-field text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1 file:text-xs file:font-semibold"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Card Image (Back View)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBackImage(e.target.files?.[0] || null)}
                      className="input-field text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-surface-muted file:px-3 file:py-1 file:text-xs file:font-semibold"
                      required
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3">
            <span className="text-xs font-semibold text-ink-900/60">Total {action === "buy" ? "Payable" : "Payout"}</span>
            <span className="text-lg font-extrabold text-ink-900">{formatNaira(calculatedTotal)}</span>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 font-bold">
            {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : `Confirm ${action === "buy" ? "Purchase" : "Sale"}`}
          </button>
        </form>
      </div>
    </div>
  );
};