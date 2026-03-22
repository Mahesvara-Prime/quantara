import React from "react";

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Surface standard (cards).
 * - Background: #1F2937 (surface)
 * - Bordure légère + ombre douce pour un rendu fintech minimal.
 */
export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-2xl bg-[#1F2937] border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

