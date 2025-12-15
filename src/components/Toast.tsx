import { useEffect } from "react";

export function Toast({
  open,
  message,
  onClose,
}: {
  open: boolean;
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 1800);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed left-1/2 top-5 z-50 -translate-x-1/2">
      <div className="rounded-2xl bg-neutral-900 px-4 py-2 text-xs text-white shadow">
        {message}
      </div>
    </div>
  );
}
