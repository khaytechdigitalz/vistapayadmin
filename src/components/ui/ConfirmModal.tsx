import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
}) => {
  return (
    <Modal open={open} onClose={onClose} title="" width="max-w-sm">
      <div className="flex flex-col items-center text-center">
        <span
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            tone === "danger" ? "bg-state-failedbg text-state-failed" : "widget-primary text-primary"
          }`}
        >
          <AlertTriangle size={20} />
        </span>
        <h3 className="text-lg font-bold text-ink-900">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-ink-900/60">{description}</p>}
      </div>
      <div className="mt-6 flex gap-3">
        <button className="btn-secondary flex-1" onClick={onClose}>
          {cancelLabel}
        </button>
        <button
          className={tone === "danger" ? "btn-danger flex-1" : "btn-primary flex-1"}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
};
