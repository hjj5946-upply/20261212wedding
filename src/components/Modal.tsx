import { useEffect, useId, useRef } from "react";

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
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // ESC 닫기 + 배경 스크롤 잠금 + 포커스 이동(최소)
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    // 최소 포커스: 모달 컨테이너로 이동
    queueMicrotask(() => {
      dialogRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/40"
        aria-label="close modal backdrop"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute left-1/2 top-1/2 w-[calc(100%-40px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow outline-none"
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
          <div id={titleId} className="text-sm font-semibold">
            {title}
          </div>
          <button
            className="text-sm text-neutral-500"
            onClick={onClose}
            aria-label="close modal"
            type="button"
          >
            닫기
          </button>
        </div>

        {/* 모달 내부 컨텐츠가 길어질 수 있으니 스크롤 허용 */}
        <div className="max-h-[70vh] overflow-auto px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
