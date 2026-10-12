import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send, Loader2, User, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/context/ToastContext";
import {
  fetchAdminTicketDetails,
  sendAdminTicketReply,
  updateAdminTicketStatus,
  markAdminTicketAsResolved,
  AdminSupportTicketItem,
} from "@/api/support";

export const SupportTicketDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();

  const [ticket, setTicket] = useState<AdminSupportTicketItem | null>(null);
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
      const res = await fetchAdminTicketDetails(ticketId);
      if (res.status && res.data) {
        setTicket(res.data);
      }
    } catch (err: any) {
      push("Failed to load ticket details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!ticket) return;
    try {
      const res = await updateAdminTicketStatus(ticket.id, newStatus);
      if (res.status) {
        setTicket({ ...ticket, status: newStatus as any });
        push(`Ticket status changed to ${newStatus}`, "success");
      }
    } catch (err: any) {
      push("Failed to update status.", "error");
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !ticket) return;

    try {
      setSendingReply(true);
      const res = await sendAdminTicketReply(ticket.id, reply.trim());
      if (res.status && res.data) {
        setTicket((t) =>
          t
            ? {
                ...t,
                status: "Answered",
                messages: [...(t.messages ?? []), res.data],
              }
            : t
        );
        setReply("");
        push("Support response sent successfully.", "success");
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
      const res = await markAdminTicketAsResolved(ticket.id);
      if (res.status) {
        setTicket((t) => (t ? { ...t, status: "Resolved" } : t));
        push("Ticket marked as resolved.", "success");
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
        <button onClick={() => navigate("/admin/support")} className="btn-secondary mt-4 text-xs">
          Back to Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-12">
      <button
        onClick={() => navigate("/admin/support")}
        className="flex items-center gap-1.5 text-xs font-bold text-ink-900/60 hover:text-ink-900 transition"
      >
        <ArrowLeft size={16} /> Back to Support Desk
      </button>

      <div className="card p-6 space-y-6 border border-surface-border">
        {/* Ticket Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-primary">#{ticket.ticket_no}</span>
              <h3 className="font-bold text-ink-900 text-lg">{ticket.subject}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-900/60">
              <span className="flex items-center gap-1 font-semibold text-ink-900">
                <User size={13} className="text-ink-900/40" /> {ticket.user?.name} ({ticket.user?.email})
              </span>
              <span>•</span>
              <span className="rounded-md bg-surface-muted px-2 py-0.5 font-medium">{ticket.category}</span>
              <span>•</span>
              <span>Opened {ticket.createdAt}</span>
            </div>
          </div>

          {/* Quick Status Control */}
          <div className="flex items-center gap-2">
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="input-field text-xs py-2"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Answered">Answered</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
            <Badge status={ticket.status as any} />
          </div>
        </div>

        {/* Conversation Thread */}
        <div className="space-y-4 min-h-[250px]">
          {(ticket.messages ?? []).map((m) => {
            const isAdmin = m.sender === "admin";
            return (
              <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs ${
                    isAdmin
                      ? "bg-primary text-white shadow-xs"
                      : "bg-surface-muted border border-surface-border text-ink-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1 border-b border-white/10 pb-1">
                    <p className={`font-bold flex items-center gap-1 ${isAdmin ? "text-secondary" : "text-ink-900"}`}>
                      {isAdmin ? <ShieldCheck size={13} /> : <User size={13} />}
                      {m.senderName}
                    </p>
                    <span className={`text-[10px] ${isAdmin ? "text-white/60" : "text-ink-900/40"}`}>
                      {m.time}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                </div>
              </div>
            );
          })}

          {(ticket.messages ?? []).length === 0 && (
            <p className="text-center text-xs text-ink-900/40 py-8">No messages recorded in this ticket thread.</p>
          )}
        </div>

        {/* Reply Form */}
        <form onSubmit={sendReply} className="mt-6 flex flex-col gap-3 border-t border-surface-border pt-5">
          <div>
            <label className="label text-xs font-bold text-ink-900/70">Respond as Support Agent</label>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={3}
              placeholder="Type official response to customer..."
              className="input-field text-xs resize-none mt-1"
            />
          </div>

          <div className="flex items-center justify-between">
            {ticket.status !== "Resolved" && ticket.status !== "Closed" && (
              <button
                type="button"
                onClick={() => setResolveOpen(true)}
                className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Mark Resolved
              </button>
            )}

            <button
              type="submit"
              className="btn-primary py-2 px-4 text-xs flex items-center gap-2 ml-auto"
              disabled={sendingReply || !reply.trim()}
            >
              {sendingReply ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send Response
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onConfirm={markResolved}
        title="Mark ticket as resolved?"
        description="This flags the customer ticket as sorted. The customer can reopen it by sending a new reply if needed."
        confirmLabel="Mark Resolved"
        tone="primary"
      />
    </div>
  );
};