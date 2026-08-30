// src/utils/useBackClose.ts
import { useEffect, useRef } from "react";

/** 우리가 밀어 넣은 히스토리 항목인지 구분하는 표식 */
const OVERLAY_STATE_KEY = "__overlay";

/**
 * StrictMode(개발)에서는 effect 가 "마운트 → 정리 → 마운트" 로 두 번 돈다.
 * 정리에서 곧바로 back() 하면, 그 back 이 처리되기 전에 두 번째 마운트가 항목을 또
 * 밀어 넣어서 순서가 엉킨다(열자마자 닫히는 것처럼 보인다).
 * 그래서 되돌리기를 한 틱 미뤄두고, 곧바로 다시 열리면 취소하고 항목을 물려받는다.
 */
let pendingBack: number | null = null;

/**
 * 오버레이가 열려 있는 동안 히스토리 항목을 하나 밀어 넣어,
 * **안드로이드/iOS 기본 뒤로가기가 페이지를 벗어나지 않고 오버레이만 닫도록** 한다.
 *
 * - 뒤로가기로 닫힌 경우: 항목이 이미 소비됐으므로 아무것도 되돌리지 않는다.
 * - X 버튼/스와이프로 닫힌 경우: 밀어 넣은 항목을 back() 으로 걷어내
 *   히스토리를 열기 전 상태로 되돌린다(닫은 뒤 뒤로가기가 한 번 먹통이 되지 않게).
 *
 * URL 은 바뀌지 않는다(`pushState` 에 URL 을 주지 않음).
 */
export function useBackClose(open: boolean, onClose: () => void) {
  // 콜백이 매 렌더 새로 만들어져도 항목을 다시 밀어 넣지 않도록 ref 로 받는다
  // (렌더 중에 ref 를 건드리면 안 되므로 갱신은 effect 에서 한다)
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;

    // owned: 우리가 밀어 넣은 항목이 아직 히스토리에 남아 있는가
    let owned = true;

    if (pendingBack !== null) {
      // 방금 닫힌 오버레이가 되돌리기를 예약해 둔 상태 → 그 항목을 그대로 물려받는다
      window.clearTimeout(pendingBack);
      pendingBack = null;
    } else {
      window.history.pushState({ [OVERLAY_STATE_KEY]: true }, "");
    }

    const onPop = () => {
      owned = false;
      onCloseRef.current();
    };
    window.addEventListener("popstate", onPop);

    return () => {
      window.removeEventListener("popstate", onPop);
      if (!owned) return;
      pendingBack = window.setTimeout(() => {
        pendingBack = null;
        // 그 사이 다른 이유로 히스토리가 움직였으면 건드리지 않는다
        if (window.history.state?.[OVERLAY_STATE_KEY]) window.history.back();
      }, 0);
    };
  }, [open]);
}
