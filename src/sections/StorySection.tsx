import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

export function StorySection({ data }: Props) {
  return (
    <Section className="px-5 py-16 bg-gradient-to-b from-white to-wedding-cream-50">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800">Our Story</h2>
          <p className="mt-2 text-sm text-neutral-500">우리의 이야기</p>
        </div>

        <div className="relative">
          {/* 타임라인 세로선 */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-wedding-pink-200 via-wedding-peach-200 to-wedding-cream-200" />

          {/* 타임라인 아이템들 */}
          <div className="space-y-8">
            {data.story.map((item, index) => (
              <div key={index} className="relative pl-20">
                {/* 아이콘 */}
                <div className="absolute left-0 flex items-center justify-center w-16 h-16 bg-white rounded-full border-4 border-wedding-pink-100 shadow-md">
                  <span className="text-2xl">{item.icon}</span>
                </div>

                {/* 콘텐츠 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-wedding-cream-200 hover:shadow-md transition-shadow">
                  <div className="text-xs text-wedding-pink-500 font-medium mb-1">
                    {item.date}
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}