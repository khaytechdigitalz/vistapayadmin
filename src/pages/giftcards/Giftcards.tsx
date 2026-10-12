import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Power, Loader2, Gift, CheckCircle, XCircle, History, Trash2, AlertTriangle } from "lucide-react";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import { formatNaira } from "@/lib/currency";
import { getImageSrc } from "@/lib/utils";
import {
  fetchGiftcards,
  createGiftcard,
  updateGiftcard,
  toggleGiftcardStatus,
  deleteGiftcard,
  Giftcard,
} from "@/api/giftcard";

export const Giftcards: React.FC = () => {
  const navigate = useNavigate();
  const { push } = useToast();

  const [giftcards, setGiftcards] = useState<Giftcard[]>([]);
  const [metrics, setMetrics] = useState({ active_count: 0, inactive_count: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<Giftcard | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [cardToDelete, setCardToDelete] = useState<Giftcard | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [buyRate, setBuyRate] = useState("");
  const [sellRate, setSellRate] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    loadGiftcards();
  }, []);

  const loadGiftcards = async () => {
    try {
      setLoading(true);
      const res = await fetchGiftcards();
      if (res.status && res.data) {
        const cardData = res.data.giftcards;
        const rows = (cardData as any).data || cardData;
        setGiftcards(Array.isArray(rows) ? rows : []);
        setMetrics(res.data.metrics || { active_count: 0, inactive_count: 0 });
      }
    } catch (err: any) {
      push("Failed to load giftcards.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCard(null);
    setName("");
    setCurrency("USD");
    setBuyRate("");
    setSellRate("");
    setDescription("");
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (card: Giftcard) => {
    setEditingCard(card);
    setName(card.name);
    setCurrency(card.currency || "USD");
    setBuyRate(card.buy_rate.toString());
    setSellRate(card.sell_rate.toString());
    setDescription(card.description || "");
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !currency || !buyRate || !sellRate) {
      push("Please fill in all required fields.", "error");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("currency", currency);
      formData.append("buy_rate", buyRate);
      formData.append("sell_rate", sellRate);
      if (description) formData.append("description", description);
      if (imageFile) formData.append("image_url", imageFile);

      let res;
      if (editingCard) {
        res = await updateGiftcard(editingCard.id, formData);
        push("Giftcard updated successfully.", "success");
      } else {
        res = await createGiftcard(formData);
        push("Giftcard created successfully.", "success");
      }

      if (res.status) {
        setIsModalOpen(false);
        loadGiftcards();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Operation failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await toggleGiftcardStatus(id);
      if (res.status && res.data) {
        setGiftcards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: res.data.status } : c))
        );
        push(res.message, "success");
        loadGiftcards();
      }
    } catch (err: any) {
      push("Failed to update giftcard status.", "error");
    }
  };

  const confirmDelete = (card: Giftcard) => {
    setCardToDelete(card);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!cardToDelete) return;
    try {
      setDeleting(true);
      const res = await deleteGiftcard(cardToDelete.id);
      if (res.status) {
        push("Giftcard deleted successfully.", "success");
        setDeleteModalOpen(false);
        setCardToDelete(null);
        loadGiftcards();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to delete giftcard.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const columns: DataTableColumn<Giftcard>[] = [
    {
      key: "name",
      header: "Giftcard",
      exportValue: (c) => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <img
            src={getImageSrc(c.image_url)}
            alt={c.name}
            className="h-10 w-10 rounded-xl object-cover border border-surface-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/placeholder.png";
            }}
          />
          <div>
            <p className="font-bold text-ink-900">{c.name}</p>
            <p className="text-xs text-ink-900/50 uppercase font-mono">{c.currency}</p>
          </div>
        </div>
      ),
    },
    {
      key: "buy_rate",
      header: "Buy Rate",
      exportValue: (c) => c.buy_rate.toString(),
      render: (c) => <span className="font-extrabold text-ink-900">{formatNaira(c.buy_rate)}/\$</span>,
    },
    {
      key: "sell_rate",
      header: "Sell Rate",
      exportValue: (c) => c.sell_rate.toString(),
      render: (c) => <span className="font-extrabold text-primary">{formatNaira(c.sell_rate)}/\$</span>,
    },
    {
      key: "status",
      header: "Status",
      exportValue: (c) => (c.status === true ? "Active" : "Disabled"),
      render: (c) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
            c.status === true ? "bg-state-successbg text-state-success" : "bg-surface-muted text-ink-900/50"
          }`}
        >
          {c.status === true ? "Active" : "Disabled"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (c) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditModal(c)}
            className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
          >
            <Edit size={13} /> Edit
          </button>
          <button
            onClick={() => handleToggleStatus(c.id)}
            className={`rounded-lg border border-surface-border p-1.5 transition ${
              c.status === true ? "text-state-success hover:bg-state-successbg" : "text-ink-900/40 hover:bg-surface-muted"
            }`}
            title={c.status === true ? "Disable giftcard" : "Enable giftcard"}
          >
            <Power size={14} />
          </button>
          <button
            onClick={() => confirmDelete(c)}
            className="rounded-lg border border-surface-border p-1.5 text-state-failed hover:bg-state-failedbg transition"
            title="Delete giftcard"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg flex items-center gap-2">
            <Gift size={18} className="text-primary" /> Giftcard Catalog Management
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">Create, configure buy/sell rates, and manage giftcard availability.</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => navigate("/app/giftcards/trades")}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
          >
            <History size={15} /> View Trades
          </button>
          <button onClick={handleOpenCreateModal} className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5">
            <Plus size={16} /> Create Giftcard Type
          </button>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-successbg text-state-success">
            <CheckCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Active Giftcards</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.active_count}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-border text-ink-900/50">
            <XCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Disabled Giftcards</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.inactive_count}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <DataTable
          columns={columns}
          rows={giftcards}
          fileName="giftcard-catalog"
          emptyLabel="No giftcards found."
          filters={{ searchKeys: ["name", "currency"] }}
        />
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCard ? "Edit Giftcard Type" : "Create New Giftcard Type"}
        description="Set up card details, currency, and buy/sell exchange rates."
        width="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Giftcard Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apple / iTunes, Amazon, Steam"
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="USD"
              required
            />
            <Input
              label="Buy Rate (₦)"
              type="number"
              step="0.01"
              value={buyRate}
              onChange={(e) => setBuyRate(e.target.value)}
              placeholder="1100"
              required
            />
            <Input
              label="Sell Rate (₦)"
              type="number"
              step="0.01"
              value={sellRate}
              onChange={(e) => setSellRate(e.target.value)}
              placeholder="1200"
              required
            />
          </div>

          <div>
            <label className="label">Brand Logo / Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="input-field text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-secondary hover:file:bg-primary-dark"
            />
          </div>

          <div>
            <label className="label">Description / Instructions (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter instructions or description for users..."
              className="input-field min-h-[90px] py-2.5 resize-none"
            />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {editingCard ? "Save Changes" : "Create Giftcard"}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
        description="Are you sure you want to delete this giftcard type?"
        width="max-w-sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-3 rounded-xl bg-state-failedbg p-3 text-state-failed text-xs font-bold">
            <AlertTriangle size={20} className="shrink-0" />
            <span>This action is permanent and cannot be undone.</span>
          </div>
          <div className="rounded-xl bg-surface-muted p-3 text-sm">
            <p className="text-ink-900/50 text-xs">Giftcard Name</p>
            <p className="font-bold text-ink-900">{cardToDelete?.name}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="btn-secondary flex-1 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteConfirmed}
              className="btn-primary flex-1 py-2 text-xs bg-state-failed hover:bg-state-failed/90 text-white flex items-center justify-center gap-1.5"
            >
              {deleting && <Loader2 size={14} className="animate-spin" />}
              Delete Giftcard
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};