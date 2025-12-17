import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { Section } from "../components/Section";
import { Button } from "../components/Button";

type Props = {
  onToast: (msg: string) => void;
};

type GuestbookRow = {
  id: string;
  created_at: string;
  name: string;
  message: string;
};

const INITIAL_LIMIT = 4; // 3개 표시 + 더보기 판단용
const PAGE_LIMIT = 20;
const COOLDOWN_MS = 12_000;
const COOLDOWN_KEY = "guestbook_last_submit_at";

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function GuestbookSection({ onToast }: Props) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [hp, setHp] = useState(""); // honeypot

  const [items, setItems] = useState<GuestbookRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    const n = name.trim();
    const m = message.trim();
    return n.length >= 2 && n.length <= 20 && m.length >= 2 && m.length <= 300;
  }, [name, message]);

  const loadLatest = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guestbook_messages")
        .select("id, created_at, name, message")
        .order("created_at", { ascending: false })
        .limit(INITIAL_LIMIT);

      if (error) throw error;

      const rows = (data ?? []) as GuestbookRow[];
      setItems(rows);
      setCursor(rows.length ? rows[rows.length - 1].created_at : null);
      setHasMore(rows.length === INITIAL_LIMIT);
    } catch {
      onToast("방명록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!cursor || !hasMore) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("guestbook_messages")
        .select("id, created_at, name, message")
        .order("created_at", { ascending: false })
        .lt("created_at", cursor)
        .limit(PAGE_LIMIT);

      if (error) throw error;

      const rows = (data ?? []) as GuestbookRow[];
      setItems((prev) => [...prev, ...rows]);
      setCursor(rows.length ? rows[rows.length - 1].created_at : cursor);
      setHasMore(rows.length === PAGE_LIMIT);
    } catch {
      onToast("추가 방명록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    if (!canSubmit) {
      onToast("이름(2~20자)과 내용을 확인해 주세요.");
      return;
    }

    // honeypot
    if (hp.trim().length > 0) {
      onToast("등록되었습니다.");
      setName("");
      setMessage("");
      return;
    }

    // cooldown
    const last = Number(localStorage.getItem(COOLDOWN_KEY) || "0");
    const now = Date.now();
    const remain = last + COOLDOWN_MS - now;
    if (remain > 0) {
      onToast(`잠시 후 다시 작성해 주세요. (${Math.ceil(remain / 1000)}초)`);
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("guestbook_messages").insert({
        name: name.trim(),
        message: message.trim(),
      });
      if (error) throw error;

      localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      onToast("등록되었습니다.");
      setName("");
      setMessage("");
      setExpanded(false);
      await loadLatest();
    } catch {
      onToast("등록에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleItems = expanded ? items : items.slice(0, 3);

  return (
    <Section id="guestbook" className="px-5 py-12 border-t border-neutral-100">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-6">
          <div className="text-xs tracking-wide text-neutral-400">GuestBook</div>
          <h2 className="mt-1 text-lg font-semibold text-neutral-900">방명록</h2>
          <p className="mt-2 text-sm text-neutral-500">축하 메시지를 남겨주세요.</p>
        </div>  

        {/* 작성 */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          {/* honeypot */}
          <div className="hidden">
            <input value={hp} onChange={(e) => setHp(e.target.value)} />
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs font-medium text-neutral-700">성함 *</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 홍길동"
                className={inputCls}
                maxLength={20}
                disabled={submitting}
              />
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-neutral-700">메시지 *</div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="축하 메시지를 남겨주세요. (최대 300자)"
                className={`${inputCls} min-h-[96px] resize-none`}
                maxLength={300}
                disabled={submitting}
              />
              <div className="mt-1 text-right text-[11px] text-neutral-400">
                {message.trim().length}/300
              </div>
            </div>

            <Button fullWidth onClick={submit} disabled={!canSubmit || submitting}>
              {submitting ? "등록 중..." : "등록하기"}
            </Button>
          </div>
        </div>

        {/* 목록 */}
        <div className="mt-6">
          {loading && items.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
              불러오는 중...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm text-neutral-600">
              아직 등록된 방명록이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleItems.map((it) => (
                <div
                  key={it.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-neutral-900">
                      {it.name}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {formatDate(it.created_at)}
                    </div>
                  </div>
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-700">
                    {it.message}
                  </div>
                  <div className="mt-4 h-px w-10 bg-wedding-gold-200" />
                </div>
              ))}

              {!expanded && items.length > 3 ? (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={() => setExpanded(true)}
                >
                  더보기
                </Button>
              ) : null}

              {expanded && hasMore ? (
                <Button
                  fullWidth
                  variant="secondary"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? "불러오는 중..." : "더 불러오기"}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

const inputCls =
  "w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-900";
