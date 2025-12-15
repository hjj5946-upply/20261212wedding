import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";

type Props = { data: WeddingConfig };

export function MessageSection({ data }: Props) {
  return (
    <Section className="px-5 py-20 bg-gradient-to-b from-white via-wedding-pink-50 to-wedding-cream-50">
      <div className="mx-auto max-w-2xl">
        <div className="relative">
          {/* 꾸미기 요소 */}
          <div className="absolute -top-6 -left-4 text-6xl text-wedding-pink-200 opacity-50">"</div>
          <div className="absolute -bottom-6 -right-4 text-6xl text-wedding-peach-200 opacity-50">"</div>

          {/* 메인 메시지 */}
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-xl border border-wedding-cream-200">
            <div className="text-center space-y-6">
              <p className="text-lg md:text-xl text-neutral-700 leading-relaxed font-light">
                사랑은 서로를 바라보는 것이 아니라
                <br />
                함께 같은 방향을 바라보는 것
              </p>

              <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-wedding-pink-300 to-transparent" />

              <p className="text-sm md:text-base text-neutral-600 leading-relaxed">
                {data.couple.groomName}와 {data.couple.brideName}
                <br />
                <br />
                서로 다른 두 사람이
                <br />
                같은 꿈을 꾸며 하나가 되는 시작,
                <br />
                그 아름다운 순간을 함께해주세요.
              </p>

              <div className="pt-4">
                <div className="inline-flex items-center gap-2 text-wedding-pink-500">
                  <span className="text-2xl">💕</span>
                  <span className="text-sm font-medium">2026년 12월 12일</span>
                  <span className="text-2xl">💕</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 부모님께 드리는 메시지 (선택사항) */}
        <div className="mt-12 text-center">
          <p className="text-sm text-neutral-500 leading-relaxed">
            두 사람의 시작을 함께해주신
            <br />
            양가 부모님께 감사드립니다.
          </p>
        </div>
      </div>
    </Section>
  );
}
