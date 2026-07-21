import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmButtonText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  onConfirm,
  confirmButtonText = 'Delete Permanently',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-md bg-[#1c1e23] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
          <div className="p-3 bg-red-950/40 border border-red-500/20 rounded-xl text-[11px] text-red-300 font-medium">
            ⚠️ Warning: Permanently deleted items cannot be recovered from storage.
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-[#282b33] flex items-center justify-end gap-2.5 bg-[#17191e]">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#252830] hover:bg-[#2d303a] text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/50 flex items-center gap-1.5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
