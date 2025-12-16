import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

type Props = { data: WeddingConfig };

export function StorySection({ data }: Props) {
  if (!data.story || data.story.length === 0) return null;

  return (
    <Section id="story" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <SectionHeader title={data.copy.storyTitle} subtitle="우리의 이야기" />

        <div className="space-y-3">
          {data.story.map((item, idx) => (
            <div
              key={`${item.date}-${idx}`}
              className="rounded-2xl border border-neutral-200 bg-white p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-wedding-ivory-50">
                  <span className="text-xl">{item.icon}</span>
                </div>

                <div className="flex-1">
                  <div className="text-xs font-medium text-neutral-500">
                    {item.date}
                  </div>
                  <div className="mt-1 text-base font-semibold text-neutral-900">
                    {item.title}
                  </div>
                  <div className="mt-2 text-sm leading-6 text-neutral-700">
                    {item.description}
                  </div>
                </div>
              </div>

              <div className="mt-4 h-px w-full bg-neutral-100" />
              <div className="mt-3 h-px w-10 bg-wedding-gold-200" />
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
