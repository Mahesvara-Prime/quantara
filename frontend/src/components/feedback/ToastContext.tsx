import React from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * Toasts légers (coin bas-droite) pour le feedback d’actions dans l’espace privé.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const showToast = React.useCallback((message: string, variant: ToastVariant = "info") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const value = React.useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-[min(100vw-2rem,20rem)] flex-col gap-2 p-0 sm:bottom-6 sm:right-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={[
              "pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
              t.variant === "success"
                ? "border-emerald-400/35 bg-emerald-950/90 text-[#E6EDF3]"
                : t.variant === "error"
                  ? "border-red-400/35 bg-red-950/90 text-[#E6EDF3]"
                  : "border-white/15 bg-[#1f2937]/95 text-[#E6EDF3]",
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => {
        /* no-op hors ToastProvider */
      },
    };
  }
  return ctx;
}
