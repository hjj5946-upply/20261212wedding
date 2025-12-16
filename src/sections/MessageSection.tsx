import type { WeddingConfig } from "../config/wedding";
import { Section } from "../components/Section";
import { SectionHeader } from "../components/SectionHeader";

type Props = { data: WeddingConfig };

export function MessageSection({ data }: Props) {
  return (
    <Section id="message" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <SectionHeader title="초대의 말씀" />

        {/* 메인 메시지 카드 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center">
          <p className="text-base leading-7 text-neutral-800">
            사랑은 서로를 바라보는 것이 아니라
            <br />
            함께 같은 방향을 바라보는 것
          </p>

          <div className="mx-auto my-6 h-px w-16 bg-wedding-gold-200" />

          <p className="text-sm leading-7 text-neutral-700">
            {data.couple.groomName}와 {data.couple.brideName}는
            <br />
            서로 다른 두 사람이 만나
            <br />
            같은 꿈을 꾸며 하나가 되는 시작에
            <br />
            소중한 분들을 초대합니다.
          </p>

          <div className="mt-6 text-xs text-neutral-500">
            2026년 12월 12일
          </div>
        </div>

        {/* 감사 문구 */}
        <div className="mt-8 text-center text-xs leading-6 text-neutral-500">
          두 사람의 시작을 함께해주신
          <br />
          양가 부모님과 소중한 분들께
          <br />
          진심으로 감사드립니다.
        </div>
      </div>
    </Section>
  );
}
