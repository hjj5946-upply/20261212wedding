import { useState } from "react";
import { Button } from "./Button";
import { Toast } from "./Toast";

export function ShareButton({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}) {
  const [toast, setToast] = useState(false);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast(true);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setToast(true);
      } catch {
        // 조용히 무시 (원하면 alert로 바꿀 수 있음)
      }
    }
  };

  return (
    <>
      <Toast open={toast} message="링크를 복사했습니다" onClose={() => setToast(false)} />
      <Button variant="secondary" onClick={share}>
        청첩장 공유하기
      </Button>
    </>
  );
}
