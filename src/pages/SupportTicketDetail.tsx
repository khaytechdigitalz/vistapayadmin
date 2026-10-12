import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import {
  fetchTicketDetails,
  sendTicketReply,
  markTicketAsResolved,
  SupportTicketItem,
} from "@/api/support";

export const SupportTicketDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [ticket, setTicket] = useState<SupportTicketItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [reply, setReply] = useState("");
  const [resolveOpen, setResolveOpen] = useState(false);

  useEffect(() => {
    if (id) loadTicket(id);
  }, [id]);

  const loadTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      const res = await fetchTicketDetails(ticketId);
      if (res.status && res.data) {
        setTicket(res.data);
      }
    } catch (err: any) {
      push("Failed to load ticket details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !ticket) return;

    try {
      setSendingReply(true);
      const res = await sendTicketReply(ticket.id, reply.trim());
      if (res.status && res.data) {
        setTicket((t) =>
          t
            ? {
                ...t,
                status: t.status === "Resolved" ? "Open" : t.status,
                messages: [...(t.messages ?? []), res.data],
              }
            : t
        );
        setReply("");
        push("Reply sent successfully", "success");
      }
    } catch (err: any) {
      push("Failed to send reply.", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const markResolved = async () => {
    if (!ticket) return;

    try {
      const res = await markTicketAsResolved(ticket.id);
      if (res.status) {
        setTicket((t) => (t ? { ...t, status: "Resolved" } : t));
        push("Ticket marked as resolved", "success");
      }
    } catch (err: any) {
      push("Failed to mark ticket as resolved.", "error");
    } finally {
      setResolveOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="card text-center py-12">
        <p className="text-sm text-ink-900/60 font-medium">Support ticket not found.</p>
        <button onClick={() => navigate("/app/support")} className="btn-secondary mt-4">
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        onClick={() => navigate("/app/support")}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-900/60 hover:text-ink-900 transition"
      >
        <ArrowLeft size={16} /> Back to Tickets
      </button>

      <div className="card">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-ink-900">{ticket.subject}</h3>
          <Badge status={ticket.status} />
        </div>
        <div className="mb-6 flex flex-wrap items-center gap-2 text-xs text-ink-900/50">
          <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium">{ticket.category}</span>
          <span>Priority: {ticket.priority}</span>
          <span>•</span>
          <span>Opened {ticket.createdAt}</span>
        </div>

        {/* Message Thread */}
        <div className="space-y-4">
          {(ticket.messages ?? []).map((m) => (
            <div key={m.id} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  m.sender === "user" ? "bg-primary text-white" : "bg-surface-muted text-ink-900"
                }`}
              >
                <p className="mb-1 text-xs font-semibold opacity-70">{m.senderName}</p>
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className={`mt-1.5 text-[10px] ${m.sender === "user" ? "text-white/50" : "text-ink-900/40"}`}>{m.time}</p>
              </div>
            </div>
          ))}

          {(ticket.messages ?? []).length === 0 && (
            <p className="text-center text-sm text-ink-900/40 py-4">No messages yet in this ticket thread.</p>
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={sendReply} className="mt-6 flex items-end gap-2 border-t border-surface-border pt-5">
          <div className="flex-1">
            <label className="label">Reply</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={2}
              placeholder="Type your reply..."
              className="input-field resize-none"
            />
          </div>
          <button type="submit" className="btn-primary h-[46px]" disabled={sendingReply || !reply.trim()}>
            {sendingReply ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>

        {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
          <button onClick={() => setResolveOpen(true)} className="btn-secondary mt-4">
            <CheckCircle2 size={16} /> Mark as Resolved
          </button>
        )}
      </div>

      <ConfirmModal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onConfirm={markResolved}
        title="Mark ticket as resolved?"
        description="You can still reply later if the issue comes back — this just lets our team know it's sorted for now."
        confirmLabel="Mark Resolved"
        tone="primary"
      />
    </div>
  );
};