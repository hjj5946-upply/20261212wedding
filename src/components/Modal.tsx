import { useEffect } from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="close modal backdrop"
        onClick={onClose}
      />
      <div className="absolute left-1/2 top-1/2 w-[calc(100%-40px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div className="text-sm font-semibold">{title}</div>
          <button
            className="text-sm text-neutral-500"
            onClick={onClose}
            aria-label="close modal"
          >
            닫기
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
