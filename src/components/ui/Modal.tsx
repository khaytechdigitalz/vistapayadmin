import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  width?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, description, children, width = "max-w-md" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} rounded-xl2 bg-white p-6 shadow-card`}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink-900">{title}</h3>
            {description && <p className="mt-1 text-sm text-ink-900/60">{description}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-900/50 hover:bg-surface-muted">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
