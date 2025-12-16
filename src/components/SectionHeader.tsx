export function SectionHeader({
    title,
    subtitle,
  }: {
    title: string;
    subtitle?: string;
  }) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <div className="mt-3 h-px w-14 bg-wedding-gold-200" />
        {subtitle ? (
          <p className="mt-3 text-sm text-neutral-500">{subtitle}</p>
        ) : null}
      </div>
    );
  }
  