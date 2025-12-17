import { Button } from "./Button";

export function FloatingCTA({
  visible,
  onShare,
  onOpenMap,
}: {
  visible: boolean;
  onShare: () => void;
  onOpenMap: () => void;
}) {
  return (
    <div
      className={[
        "fixed bottom-4 left-1/2 z-40 w-[calc(100%-32px)] max-w-md -translate-x-1/2",
        "transition-all duration-300",
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none",
      ].join(" ")}
    >
      <div className="rounded-2xl border border-neutral-200 bg-white/90 p-2 shadow backdrop-blur">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onShare}>
            공유
          </Button>
          <Button variant="secondary" onClick={onOpenMap}>
            길찾기
          </Button>
        </div>
      </div>
    </div>
  );
}
