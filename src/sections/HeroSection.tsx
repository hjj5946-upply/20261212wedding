import { useEffect, useMemo, useState } from "react";
import type { WeddingConfig } from "../config/wedding";
import { Button } from "../components/Button";
import { asset } from "../utils/asset";

type Props = {
  data: WeddingConfig;
  onShare: () => void;
};

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function msToHMS(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}

export function HeroSection({ data, onShare }: Props) {
  const target = useMemo(() => new Date(data.ceremony.dateISO), [data.ceremony.dateISO]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const ddayDays = useMemo(() => {
    const diff =
      startOfDay(target).getTime() - startOfDay(now).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [now, target]);

  const msLeft = target.getTime() - now.getTime();
  const within48h = msLeft > 0 && msLeft <= 48 * 60 * 60 * 1000;
  const hms = msToHMS(msLeft);

  const heroImg = asset("images/main_img.jpg");

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* 배경 이미지 */}
      <img
        src={heroImg}
        alt="Wedding"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* 가독성용 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/40" />

      {/* 상단 D-day */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
        <div className="rounded-full bg-white/80 px-4 py-2 backdrop-blur border border-neutral-200">
          {msLeft <= 0 ? (
            <span className="text-sm font-semibold">오늘이 그날!</span>
          ) : within48h ? (
            <span className="text-sm font-semibold">
              D-{ddayDays} · {String(hms.h).padStart(2, "0")}:
              {String(hms.m).padStart(2, "0")}:
              {String(hms.s).padStart(2, "0")}
            </span>
          ) : (
            <span className="text-sm font-semibold">D-{ddayDays}</span>
          )}
        </div>
      </div>

      {/* 하단 정보 카드 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-8">
        <div className="mx-auto max-w-md rounded-3xl bg-white/50 backdrop-blur border border-neutral-200 p-6 text-center">
          <div className="text-xs tracking-widest text-neutral-500">
            WEDDING INVITATION
          </div>

          <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
            {data.couple.groomName}
            <span className="mx-2 text-neutral-300">&amp;</span>
            {data.couple.brideName}
          </h1>

          <div className="mx-auto mt-4 h-px w-12 bg-wedding-gold-200" />

          <p className="mt-4 text-sm leading-6 text-neutral-700">
            소중한 분들을 모시고
            <br />
            저희의 새로운 시작을 함께하려 합니다.
          </p>

          <div className="mt-5 text-sm text-neutral-700">
            <div className="font-medium">{data.ceremony.dateText}</div>
            <div className="mt-1 text-neutral-600">
              {data.ceremony.venueName}
            </div>
          </div>

          <div className="mt-6">
            <Button fullWidth variant="secondary" onClick={onShare}>
              청첩장 공유하기
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-white/80">
          ↓ 아래로 스크롤
        </div>
      </div>
    </section>
  );
}
