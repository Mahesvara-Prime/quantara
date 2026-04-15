import React from "react";
import { Outlet } from "react-router-dom";
import { PrivateMobileNav, PrivateSidebar } from "../../components/common/PrivateSidebar";
import { ToastProvider } from "../../components/feedback/ToastContext";

/**
 * Layout principal de l'interface privée.
 * - Toasts globaux (`ToastProvider`)
 * - Navigation mobile + sidebar desktop
 */
export function PrivateLayout() {
  return (
    <ToastProvider>
      <div className="min-h-dvh bg-[#111827] text-[#E6EDF3]">
        <PrivateMobileNav />
        <PrivateSidebar />

        <main className="min-h-dvh pt-14 md:pt-0 md:pl-72">
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">
            <Outlet />
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

