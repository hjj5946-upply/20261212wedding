import { Modal } from "./Modal";

export function ImageModal({
  open,
  title,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  title: string;
  src: string;
  alt?: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="overflow-hidden rounded-2xl border border-neutral-200">
        <img src={src} alt={alt ?? title} className="w-full" />
      </div>
    </Modal>
  );
}
