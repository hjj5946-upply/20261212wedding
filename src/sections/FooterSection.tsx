import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

export function FooterSection({ data }: Props) {
  return (
    <Section id="footer" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md text-center">
        <div className="text-sm font-medium text-neutral-900">
          {data.couple.groomName} ♥ {data.couple.brideName}
        </div>
        <div className="mx-auto mt-4 h-px w-14 bg-wedding-gold-200" />
        <div className="mt-4 text-xs text-neutral-500">© 2026 Hong JeongJun</div>
      </div>
    </Section>
  );
}
