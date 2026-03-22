import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Variant visuel.
   * - primary: accent bleu
   * - secondary: surface sombre
   * - ghost: transparent
   */
  variant?: ButtonVariant;
  /** Taille (hauteur, padding, typo). */
  size?: ButtonSize;
  /** État de chargement (UI seulement). */
  isLoading?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
  "transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-0 " +
  "disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#3B82F6] text-white hover:bg-[#2f74df] active:bg-[#2a66c7]",
  secondary:
    "bg-[#1F2937] text-[#E6EDF3] border border-white/10 hover:bg-white/5",
  ghost: "bg-transparent text-[#E6EDF3] hover:bg-white/5 border border-transparent",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

/**
 * Bouton réutilisable (design system).
 * Ce composant n'embarque aucune logique métier : uniquement UI, accessibilité et états.
 */
export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[base, variants[variant], sizes[size], className].join(" ")}
      {...props}
    >
      {isLoading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          aria-hidden="true"
        />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

