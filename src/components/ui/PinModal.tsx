import React, { useState, useEffect, useRef } from "react";
import { Modal } from "./Modal";

interface PinModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (pin: string) => void;
  length?: number;
  title?: string;
  description?: string;
}

export const PinModal: React.FC<PinModalProps> = ({
  open,
  onClose,
  onSuccess,
  length = 4,
  title = "Enter PIN",
  description = "Please enter your security PIN to confirm.",
}) => {
  const [pin, setPin] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset inputs and focus first box when modal opens
  useEffect(() => {
    if (open) {
      setPin(Array(length).fill(""));
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [open, length]);

  const handleChange = (val: string, index: number) => {
    // Only allow single digit numbers
    const digit = val.replace(/\D/g, "").slice(-1);
    
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    // Auto-advance focus to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace") {
      if (!pin[index] && index > 0) {
        // Focus previous input on empty backspace
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    const newPin = Array(length).fill("");
    for (let i = 0; i < pastedData.length; i++) {
      newPin[i] = pastedData[i];
    }
    setPin(newPin);

    // Focus last filled box or next available box
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullPin = pin.join("");
    if (fullPin.length === length) {
      onSuccess(fullPin);
    }
  };

  const isComplete = pin.join("").length === length;

  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <form onSubmit={handleSubmit} className="my-6">
        <div className="flex justify-center gap-2">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              className="h-12 w-12 rounded-xl border border-surface-border text-center text-lg font-bold outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!isComplete}
          className="btn-primary mt-6 w-full"
        >
          Confirm PIN
        </button>
      </form>
    </Modal>
  );
};