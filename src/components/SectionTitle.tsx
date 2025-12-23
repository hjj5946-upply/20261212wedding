type Props = {
  english: string;
  korean: string;
};

export function SectionTitle({ english, korean }: Props) {
  return (
    <div className="text-center">
      <div className="text-[13px] font-semibold tracking-[0.22em] text-neutral-800">
        {english}
      </div>
      <div className="mt-2 text-sm font-semibold text-neutral-600">{korean}</div>
      <div className="mx-auto mt-4 h-px w-12 bg-wedding-gold-200" />
    </div>
  );
}
