import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { useToast } from "@/context/ToastContext";
import { fetchKycHistory, approveKyc, rejectKyc, KycSubmission } from "@/api/kyc";
import { cn, getImageSrc } from "@/lib/utils";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Loader2,
  Eye,
  Check,
  X,
  FileText,
  User,
  ExternalLink,
  ImageIcon,
} from "lucide-react";

export const KycVerification: React.FC = () => {
  const { push } = useToast();

  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [metrics, setMetrics] = useState({
    total_submissions: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");

  // Modals & Inspection Drawer
  const [selectedSub, setSelectedSub] = useState<KycSubmission | null>(null);
  const [approveModalOpen, setApproveModalOpen] = useState<boolean>(false);
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [submittingAction, setSubmittingAction] = useState<boolean>(false);

  useEffect(() => {
    loadKycSubmissions();
  }, [search, statusFilter, levelFilter]);

  const loadKycSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetchKycHistory({
        search: search || undefined,
        status: statusFilter || undefined,
        level: levelFilter ? Number(levelFilter) : undefined,
        per_page: 20,
      });

      if (res.status && res.data) {
        const subData = res.data.submissions;
        const rows = Array.isArray(subData) ? subData : subData?.data || [];
        setSubmissions(rows);
        if (res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      }
    } catch (err: any) {
      push("Failed to load KYC verification history.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSub) return;
    try {
      setSubmittingAction(true);
      const res = await approveKyc({
        kyc_id: selectedSub.id,
        level: selectedLevel,
      });
      if (res.status) {
        push(res.message || "KYC updated successfully!", "success");
        setApproveModalOpen(false);
        setSelectedSub(null);
        loadKycSubmissions();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to approve KYC.", "error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSub) return;
    if (!rejectionReason.trim()) {
      push("Please provide a rejection reason.", "error");
      return;
    }

    try {
      setSubmittingAction(true);
      const res = await rejectKyc({
        kyc_id: selectedSub.id,
        level: selectedLevel,
        rejection_reason: rejectionReason,
      });
      if (res.status) {
        push(res.message || "KYC rejected successfully.", "success");
        setRejectModalOpen(false);
        setRejectionReason("");
        setSelectedSub(null);
        loadKycSubmissions();
      }
    } catch (err: any) {
      push(err?.response?.data?.message || "Failed to reject KYC.", "error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const columns: DataTableColumn<KycSubmission>[] = [
    {
      key: "user",
      header: "User / Applicant",
      exportValue: (s: any) => s.user?.name || "",
      render: (s: any) => (
        <div>
          <p className="text-xs font-bold text-ink-900">{s.user?.name || "Unknown User"}</p>
          <p className="text-[11px] text-ink-900/50">{s.user?.email || "N/A"}</p>
        </div>
      ),
    },
    {
      key: "current_level",
      header: "Current Tier",
      exportValue: (s) => `Tier ${s.current_level}`,
      render: (s) => (
        <span className="font-semibold text-xs text-primary bg-primary/10 px-2 py-1 rounded-md">
          Tier {s.current_level}
        </span>
      ),
    },
    {
      key: "id_number",
      header: "ID Number",
      exportValue: (s) => s.id_number || "",
      render: (s) => <span className="font-mono text-xs text-ink-900">{s.id_number || "N/A"}</span>,
    },
    {
      key: "status",
      header: "Overall Status",
      exportValue: (s) => s.status,
      render: (s) => <Badge status={s.status} />,
    },
    {
      key: "updated_at",
      header: "Last Updated",
      exportValue: (s) => new Date(s.updated_at).toLocaleString(),
      render: (s) => <span className="text-xs text-ink-900/60">{new Date(s.updated_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      exportValue: () => "",
      render: (s) => (
        <button
          onClick={() => setSelectedSub(s)}
          className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1"
        >
          <Eye size={13} /> Inspect
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <h3 className="font-bold text-ink-900 text-lg sm:text-xl flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" /> KYC Verification Oversight
          </h3>
          <p className="text-xs sm:text-sm text-ink-900/55">
            Audit user identity documents, review proof of address, and manage tiered approvals.
          </p>
        </div>
      </div>

      {/* KPI Metrics Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Total Submissions</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.total_submissions}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Pending Review</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.pending_count}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-successbg text-state-success">
            <CheckCircle2 size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Approved</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.approved_count}</p>
          </div>
        </div>
        <div className="card bg-surface-muted p-4 border border-surface-border flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-failedbg text-state-failed">
            <AlertCircle size={20} />
          </span>
          <div>
            <p className="text-xs text-ink-900/50 uppercase font-semibold">Rejected</p>
            <p className="text-xl font-extrabold text-ink-900 mt-0.5">{metrics.rejected_count}</p>
          </div>
        </div>
      </div>

      {/* Main Filter & Table Card */}
      <div className="card p-4 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-900/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicant name, email, ID..."
              className="input-field pl-9 text-xs py-2.5"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field text-xs capitalize py-2.5"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="input-field text-xs py-2.5"
          >
            <option value="">All Tiers (1, 2, 3)</option>
            <option value="1">Tier 1</option>
            <option value="2">Tier 2</option>
            <option value="3">Tier 3</option>
          </select>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={submissions}
            fileName="admin-kyc-history"
            emptyLabel="No KYC submissions found matching your criteria."
            pageSize={20}
          />
        )}
      </div>

      {/* KYC Inspection Side Drawer */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-surface-border flex items-center justify-between bg-surface-muted/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                <h3 className="font-bold text-ink-900">KYC Inspection Panel</h3>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="rounded-lg p-1.5 text-ink-900/50 hover:bg-surface-border transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Applicant Info Header */}
              <div className="rounded-xl bg-surface-muted p-4 border border-surface-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase font-semibold text-ink-900/50">Applicant</span>
                  <Badge status={selectedSub.status} />
                </div>
                <p className="text-base font-bold text-ink-900">{selectedSub.user?.name || "N/A"}</p>
                <p className="text-xs text-ink-900/60">{selectedSub.user?.email} | {selectedSub.user?.phone || "No phone"}</p>
              </div>

              {/* Rejection Reason (If any) */}
              {selectedSub.rejection_reason && (
                <div className="rounded-xl bg-state-failedbg p-4 border border-state-error/30 space-y-1">
                  <p className="text-xs font-bold text-state-error uppercase">Rejection Reason</p>
                  <p className="text-xs text-state-error">{selectedSub.rejection_reason}</p>
                </div>
              )}

              {/* LEVEL 1 REVIEW */}
              <div className="rounded-xl border border-surface-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ink-900 text-xs uppercase tracking-wider">Level 1: Government ID</h4>
                  <Badge status={selectedSub.level_1_status as any} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-ink-900/50">Type:</span> <span className="font-semibold uppercase">{selectedSub.id_type || "N/A"}</span></div>
                  <div><span className="text-ink-900/50">Number:</span> <span className="font-mono font-semibold">{selectedSub.id_number || "N/A"}</span></div>
                </div>

                {/* Document Previews using getImageSrc */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {selectedSub.id_card_front && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-ink-900/60">Front ID</p>
                      <a href={getImageSrc(selectedSub.id_card_front)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-surface-border hover:opacity-90 transition">
                        <img src={getImageSrc(selectedSub.id_card_front)} alt="Front ID" className="h-24 w-full object-cover" />
                      </a>
                    </div>
                  )}
                  {selectedSub.id_card_back && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-ink-900/60">Back ID</p>
                      <a href={getImageSrc(selectedSub.id_card_back)} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-surface-border hover:opacity-90 transition">
                        <img src={getImageSrc(selectedSub.id_card_back)} alt="Back ID" className="h-24 w-full object-cover" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-3 border-t border-surface-border">
                  <button
                    onClick={() => {
                      setSelectedLevel(1);
                      setApproveModalOpen(true);
                    }}
                    className="btn-secondary py-1 px-2.5 text-xs text-state-success border-state-success/30 hover:bg-state-successbg"
                  >
                    Approve Level 1
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLevel(1);
                      setRejectModalOpen(true);
                    }}
                    className="btn-secondary py-1 px-2.5 text-xs text-state-error border-state-error/30 hover:bg-state-failedbg"
                  >
                    Reject Level 1
                  </button>
                </div>
              </div>

              {/* LEVEL 2 REVIEW */}
              <div className="rounded-xl border border-surface-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ink-900 text-xs uppercase tracking-wider">Level 2: Proof of Address</h4>
                  <Badge status={selectedSub.level_2_status as any} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-ink-900/50">Type:</span> <span className="font-semibold uppercase">{selectedSub.address_type || "N/A"}</span></div>
                  <div><span className="text-ink-900/50">Utility:</span> <span className="font-semibold">{selectedSub.utility_bill_type || "N/A"}</span></div>
                </div>

                {selectedSub.address_document && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-ink-900/60 mb-1">Address Document</p>
                    <a href={getImageSrc(selectedSub.address_document)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 btn-secondary text-xs py-1.5 px-3">
                      <ExternalLink size={12} /> View Document File
                    </a>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-surface-border">
                  <button
                    onClick={() => {
                      setSelectedLevel(2);
                      setApproveModalOpen(true);
                    }}
                    className="btn-secondary py-1 px-2.5 text-xs text-state-success border-state-success/30 hover:bg-state-successbg"
                  >
                    Approve Level 2
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLevel(2);
                      setRejectModalOpen(true);
                    }}
                    className="btn-secondary py-1 px-2.5 text-xs text-state-error border-state-error/30 hover:bg-state-failedbg"
                  >
                    Reject Level 2
                  </button>
                </div>
              </div>

              {/* LEVEL 3 REVIEW */}
              <div className="rounded-xl border border-surface-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ink-900 text-xs uppercase tracking-wider">Level 3: Liveness Check</h4>
                  <Badge status={selectedSub.level_3_status as any} />
                </div>

                {selectedSub.liveness_photo && (
                  <div className="pt-2 flex items-center gap-4">
                    <div className="overflow-hidden rounded-xl border border-surface-border">
                      <img
                        src={getImageSrc(selectedSub.liveness_photo)}
                        alt="Liveness Selfie"
                        className="h-20 w-20 object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-ink-900">Biometric Snapshot</p>
                      <a href={getImageSrc(selectedSub.liveness_photo)} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                        <ExternalLink size={12} /> Open Full Image
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-surface-border">
                  <button
                    onClick={() => {
                      setSelectedLevel(3);
                      setApproveModalOpen(true);
                    }}
                    className="btn-secondary py-1 px-2.5 text-xs text-state-success border-state-success/30 hover:bg-state-successbg"
                  >
                    Approve Level 3
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLevel(3);
                      setRejectModalOpen(true);
                    }}
                    className="btn-secondary py-1 px-2.5 text-xs text-state-error border-state-error/30 hover:bg-state-failedbg"
                  >
                    Reject Level 3
                  </button>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-surface-border bg-surface-muted/50 flex gap-3">
              <button
                onClick={() => {
                  setSelectedLevel(undefined);
                  setApproveModalOpen(true);
                }}
                className="btn-primary flex-1 py-2.5 text-xs"
              >
                Approve Overall KYC
              </button>
              <button
                onClick={() => {
                  setSelectedLevel(undefined);
                  setRejectModalOpen(true);
                }}
                className="btn-secondary flex-1 py-2.5 text-xs text-state-error border-state-error/30 hover:bg-state-failedbg"
              >
                Reject Overall KYC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- APPROVAL CONFIRMATION MODAL --- */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-successbg text-state-success">
                <Check size={20} />
              </span>
              <div>
                <h3 className="font-bold text-ink-900 text-lg">
                  {selectedLevel ? `Approve Level ${selectedLevel}?` : "Approve Overall KYC?"}
                </h3>
                <p className="text-xs text-ink-900/50">This will update verification access for the user.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="btn-secondary flex-1 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleApprove}
                className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
              >
                {submittingAction && <Loader2 size={14} className="animate-spin" />}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- REJECTION MODAL WITH REASON --- */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-state-failedbg text-state-error">
                <X size={20} />
              </span>
              <div>
                <h3 className="font-bold text-ink-900 text-lg">
                  {selectedLevel ? `Reject Level ${selectedLevel}?` : "Reject Overall KYC?"}
                </h3>
                <p className="text-xs text-ink-900/50">Please provide a reason for rejection.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-ink-900/70">Reason for Rejection</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Document is blurry or expired."
                className="input-field mt-1 w-full text-xs"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="btn-secondary flex-1 py-2.5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submittingAction}
                onClick={handleReject}
                className="btn-primary flex-1 py-2.5 text-xs bg-state-error hover:bg-state-error/90 text-white flex items-center justify-center gap-2"
              >
                {submittingAction && <Loader2 size={14} className="animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};