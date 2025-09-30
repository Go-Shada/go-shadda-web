"use client";
import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type ModalTab = {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
};

export function ModalTabs({
  open,
  onClose,
  tabs,
  activeTabId,
  onTabChange,
  title,
  slideIn = "right",
}: {
  open: boolean;
  onClose: () => void;
  tabs: ModalTab[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  title?: string;
  slideIn?: "right" | "bottom" | "center";
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  // Prevent background scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const panelBase =
    "fixed bg-white dark:bg-background-dark text-content-light dark:text-content-dark shadow-2xl transition-transform duration-300 ease-out";
  const positions: Record<string, string> = {
    right: "top-0 right-0 h-full w-full max-w-md translate-x-full",
    bottom: "left-0 bottom-0 w-full max-h-[85vh] translate-y-full",
    center:
      "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-2xl rounded-xl",
  };
  const activeTransforms: Record<string, string> = {
    right: "translate-x-0",
    bottom: "translate-y-0",
    center: "scale-100",
  };
  const initialTransforms: Record<string, string> = {
    right: "translate-x-full",
    bottom: "translate-y-full",
    center: "scale-95",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          aria-hidden={!open}
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={`${panelBase} ${positions[slideIn]}`}
            style={{
              borderTopLeftRadius: slideIn === "right" ? "0.75rem" : undefined,
              borderTopRightRadius: slideIn === "right" ? "0" : undefined,
              borderTopWidth: slideIn === "bottom" ? 1 : undefined,
            }}
            initial={{
              x: slideIn === 'right' ? 400 : 0,
              y: slideIn === 'bottom' ? 200 : (slideIn === 'center' ? -80 : 0),
              scale: slideIn === 'center' ? 0.98 : 1,
              opacity: 1,
            }}
            animate={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            exit={{
              x: slideIn === 'right' ? 400 : 0,
              y: slideIn === 'bottom' ? 200 : (slideIn === 'center' ? -60 : 0),
              scale: slideIn === 'center' ? 0.98 : 1,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 25 }}
          >
            {/* Header */}
            <div className={`sticky top-0 flex items-center justify-between px-4 py-3 ${
              slideIn === 'center'
                ? 'bg-gradient-to-r from-white to-gray-50 dark:from-background-dark dark:to-background-dark/90 rounded-t-xl border-b border-black/10 dark:border-white/10'
                : 'bg-inherit border-b border-black/10 dark:border-white/10'
            }`}>
              <div className="font-semibold text-lg truncate">{title || "Details"}</div>
              <button
                aria-label="Close"
                onClick={onClose}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-base"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="px-4 pt-3">
              <div className="relative flex gap-2 overflow-x-auto pb-2">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onTabChange(t.id)}
                    className={`relative px-3 py-1.5 rounded-full text-sm border transition-base ${
                      activeTabId === t.id
                        ? "bg-primary text-white border-primary"
                        : "text-content-light/70 dark:text-content-dark/70 border-black/10 dark:border-white/10 hover:text-primary"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <motion.div
                className="h-[2px] bg-primary rounded-full mt-2"
                layoutId="tab-underline"
                initial={false}
                animate={{ opacity: 1 }}
              />
            </div>

            {/* Content */}
            <div className={`p-4 overflow-y-auto ${slideIn === 'center' ? 'max-h-[70vh]' : 'max-h-[calc(100vh-8rem)]'}`}>
              {tabs.find((t) => t.id === activeTabId)?.content}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
