"use client";
import React from "react";
import { ToastProvider } from "./Toaster";
import { Providers } from "../store/Providers";

export function RootClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Providers>{children}</Providers>
    </ToastProvider>
  );
}
