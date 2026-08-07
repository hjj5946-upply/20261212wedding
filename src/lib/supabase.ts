import type { SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * @supabase/supabase-js 는 초기 번들에서 가장 큰 의존성(약 178KB)이지만
 * 실제로는 방명록에서만 쓰인다. 최초 사용 시점에 동적으로 불러온다.
 * (한 번 로드된 클라이언트는 모듈 레벨에서 재사용 = 기존 싱글턴 동작 유지)
 */
export function getSupabase(): Promise<SupabaseClient> {
  if (!clientPromise) {
    clientPromise = (async () => {
      if (!url || !anon) {
        throw new Error(
          "Supabase env missing: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY"
        );
      }
      const { createClient } = await import("@supabase/supabase-js");
      return createClient(url, anon);
    })();

    // 실패한 프라미스를 캐시해두면 재시도가 막히므로 초기화
    clientPromise.catch(() => {
      clientPromise = null;
    });
  }

  return clientPromise;
}
