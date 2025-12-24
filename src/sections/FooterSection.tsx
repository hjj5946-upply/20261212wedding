import { Section } from "../components/Section";

export function FooterSection() {
  return (
    <Section id="footer" className="px-5 py-16 border-t border-neutral-100">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto h-[0.5px] w-24 bg-[#63a356]" />
        <div className="mt-10 text-xs text-neutral-400">
          © 2026 Hong JeongJun
        </div>
      </div>
    </Section>
  );
}
