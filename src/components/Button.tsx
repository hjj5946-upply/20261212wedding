import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  fullWidth?: boolean; // ✅ 추가
};

export function Button({
  className = "",
  variant = "primary",
  fullWidth = false,
  type,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-medium active:scale-[0.99] transition disabled:opacity-50 disabled:pointer-events-none";
  const width = fullWidth ? "w-full" : "w-auto";
  const styles =
    variant === "primary"
      ? "bg-neutral-900 text-white"
      : "bg-neutral-100 text-neutral-900";

  // 폼이 생기면 submit 사고가 나서 기본값을 button으로 둠
  const safeType = type ?? "button";

  return (
    <button
      className={`${base} ${width} ${styles} ${className}`}
      type={safeType}
      {...props}
    />
  );
}
