import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Star,
  Trash2,
  Users,
  Landmark,
  Send,
  Loader2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import {
  fetchBeneficiaries,
  deleteBeneficiary,
  Beneficiary,
} from "@/api/payouts";

type Tab = "all" | "favorites";

const avatarColors = ["#0E3B39", "#00A859", "#027A48", "#121212", "#2B524E"];

export const Beneficiaries: React.FC = () => {
  const navigate = useNavigate();
  const { push } = useToast();

  // Data States
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);

  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  // 1. Load Beneficiaries
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const benRes = await fetchBeneficiaries();

      if (benRes.data) {
        setBeneficiaries(benRes.data);
      }
    } catch (err: any) {
      push("Failed to load beneficiaries.", "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Delete Beneficiary
  const handleDelete = async (id: number) => {
    try {
      const res = await deleteBeneficiary(id);
      if (res.status) {
        setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
        push("Beneficiary removed.", "success");
      }
    } catch (err: any) {
      setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
      push("Beneficiary removed locally.", "success");
    }
  };

  // Toggle Favorite
  const toggleFavorite = (id: number) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  // Filter List
  const filtered = useMemo(() => {
    return beneficiaries
      .filter(
        (b) =>
          b.account_name.toLowerCase().includes(query.toLowerCase()) ||
          b.bank_name.toLowerCase().includes(query.toLowerCase()) ||
          b.account_number.includes(query)
      )
      .filter((b) => (tab === "favorites" ? favorites.includes(b.id) : true));
  }, [beneficiaries, query, tab, favorites]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top Widgets */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="widget-primary rounded-xl2 p-5">
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-secondary">
            <Users size={16} />
          </span>
          <p className="text-2xl font-extrabold text-ink-900">{beneficiaries.length}</p>
          <p className="text-xs font-semibold text-ink-900/50">Total Recipients</p>
        </div>

        <div className="widget-secondary rounded-xl2 p-5">
          <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-primary-dark">
            <Star size={16} />
          </span>
          <p className="text-2xl font-extrabold text-ink-900">{favorites.length}</p>
          <p className="text-xs font-semibold text-ink-900/50">Favorites</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-900/40"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, bank, or account..."
                className="input-field pl-10"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-2">
          {(["all", "favorites"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold capitalize transition ${
                tab === t
                  ? "bg-primary text-white"
                  : "bg-surface-muted text-ink-900/60"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Recipients Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, idx) => {
            const isFav = favorites.includes(r.id);
            const avatarColor = avatarColors[idx % avatarColors.length];

            return (
              <div
                key={r.id}
                className="group relative overflow-hidden rounded-xl border border-surface-border p-4 transition hover:shadow-card"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full opacity-[0.06]"
                  style={{ backgroundColor: avatarColor }}
                />
                <div className="relative mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white ring-4 ring-white"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {r.account_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {r.account_name}
                      </p>
                      <p className="text-xs text-ink-900/50">{r.bank_name}</p>
                    </div>
                  </div>

                  <button onClick={() => toggleFavorite(r.id)}>
                    <Star
                      size={16}
                      className={
                        isFav
                          ? "fill-secondary-dark text-secondary-dark"
                          : "text-ink-900/25"
                      }
                    />
                  </button>
                </div>

                <div className="relative mb-4 flex items-center gap-1.5 text-xs text-ink-900/50">
                  <Landmark size={12} /> {r.bank_name} · {r.account_number}
                </div>

                <div className="relative flex gap-2">
                  <button
                    onClick={() =>
                      navigate("/app/transfer", {
                        state: {
                          accountNumber: r.account_number,
                          bankCode: r.bank_code,
                          accountName: r.account_name,
                        },
                      })
                    }
                    className="btn-primary flex-1 py-1.5 text-xs"
                  >
                    <Send size={13} /> Send
                  </button>

                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg border border-surface-border p-2 text-state-failed hover:bg-state-failedbg"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="col-span-full py-10 text-center text-sm text-ink-900/40">
              No recipients match your search.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};