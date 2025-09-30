"use client";
import { AnimatePresence, motion } from "framer-motion";
import React, { createContext, useContext, useMemo, useState, useCallback } from "react";

export type ToastItem = { id: number; message: string; type?: "success" | "error" | "info"; href?: string; linkText?: string };

const ToastContext = createContext<{
  push: (message: string, type?: ToastItem["type"], options?: { href?: string; linkText?: string }) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((message: string, type?: ToastItem["type"], options?: { href?: string; linkText?: string }) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, type, href: options?.href, linkText: options?.linkText }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed top-4 right-4 z-[200] space-y-2">
        <AnimatePresence>
          {items.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`pointer-events-auto min-w-[220px] max-w-[320px] rounded-lg shadow-lg p-3 text-sm flex items-start gap-2 border ${
                t.type === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : t.type === "error"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-blue-50 border-blue-200 text-blue-800"
              }`}
            >
              <span className="mt-0.5">
                {t.type === "success" ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                ) : t.type === "error" ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 18.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/></svg>
                )}
              </span>
              <div className="flex-1">
                <div>{t.message}</div>
                {t.href && (
                  <a href={t.href} className="underline font-medium inline-block mt-1">
                    {t.linkText || 'View'}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
