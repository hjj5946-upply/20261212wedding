import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "w-full rounded-2xl px-4 py-3 text-sm font-medium active:scale-[0.99] transition";
  const styles =
    variant === "primary"
      ? "bg-neutral-900 text-white"
      : "bg-neutral-100 text-neutral-900";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
