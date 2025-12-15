import type { WeddingConfig } from "../config/wedding";
type Props = { data: WeddingConfig };

export function FooterSection({ data }: Props) {
  return (
    <footer className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md text-center text-xs text-neutral-500">
        <div>
          {data.couple.groomName} &amp; {data.couple.brideName}
        </div>
        <div className="mt-2">© 2026 Wedding Invitation</div>
      </div>
    </footer>
  );
}
