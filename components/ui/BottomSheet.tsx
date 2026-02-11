"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-auto pb-safe"
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-slate-200" />
            </div>
            {title && (
              <div className="flex items-center justify-between px-5 pb-4">
                <h3 className="text-lg font-bold font-[family-name:var(--font-display)] text-slate-900">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            )}
            <div className="px-5 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
