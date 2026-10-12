import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LifeBuoy, MessageCircle, ChevronRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { useToast } from "@/context/ToastContext";
import {
  fetchSupportTickets,
  createSupportTicket,
  SupportTicketItem,
} from "@/api/support";

const categories = ["Transfers", "Bills Payment", "Security", "Cards", "API / Developers", "Other"];

export const SupportTicketPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { push } = useToast();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const res = await fetchSupportTickets();
      if (res.status && res.data) {
        setTickets(res.data);
      }
    } catch (err: any) {
      push("Failed to load support tickets.", "error");
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      push("Fill in the subject and message", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await createSupportTicket(subject, category, message);
      if (res.status && res.data) {
        setTickets((prev) => [res.data, ...prev]);
        push("Support ticket submitted — we'll respond shortly", "success");
        setOpen(false);
        setSubject("");
        setMessage("");
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to submit support ticket.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="card lg:col-span-2">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-primary">
              <LifeBuoy size={16} />
            </span>
            <h3 className="font-bold text-ink-900">Support Tickets</h3>
          </div>
          <button onClick={() => setOpen(true)} className="btn-primary">
            <Plus size={16} /> New Ticket
          </button>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-900/50">
            No support tickets found. Click "New Ticket" to contact support.
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/app/support/${t.id}`)}
                className="flex w-full items-center justify-between gap-3 py-4 text-left hover:bg-surface-muted px-2 rounded-xl transition"
              >
                <div className="flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-900">{t.subject}</p>
                    <Badge status={t.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink-900/50">
                    <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium">{t.category}</span>
                    <span>Priority: {t.priority}</span>
                    <span>•</span>
                    <span>Updated {t.lastUpdate}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="shrink-0 text-ink-900/30" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sidebar Info */}
      <div className="space-y-5">
        <div className="card bg-primary text-white">
          <MessageCircle size={20} className="mb-3 text-secondary" />
          <h3 className="mb-1 font-bold">Live Chat</h3>
          <p className="mb-4 text-sm text-white/60">Our support team is online and typically responds in under 5 minutes.</p>
          <button className="btn-primary w-full">Start Live Chat</button>
        </div>
        <div className="card">
          <h3 className="mb-3 font-bold text-ink-900">Help Center</h3>
          <div className="space-y-2 text-sm">
            {["How do bank transfers work?", "Why was my bill payment declined?", "How do I enable 2FA?", "How do I request an API key?"].map((q) => (
              <button key={q} className="block w-full rounded-lg px-3 py-2 text-left text-ink-900/70 hover:bg-surface-muted">
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="New Support Ticket" description="Describe your issue and we'll get back to you.">
        <form onSubmit={submit} className="space-y-4">
          <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Transaction Issue" required />
          <Dropdown
            label="Category"
            options={categories.map((c) => ({ value: c, label: c }))}
            value={category}
            onChange={setCategory}
            searchPlaceholder="Search category..."
          />
          <div>
            <label className="label">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe your issue in detail..."
              className="input-field resize-none"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Submit Ticket"}
          </button>
        </form>
      </Modal>
    </div>
  );
};