export async function shareOrCopyLink(opts: {
    title: string;
    text: string;
    url: string;
  }): Promise<"shared" | "copied" | "failed"> {
    // 1) Web Share API 시도
    try {
      if (navigator.share) {
        await navigator.share(opts);
        return "shared";
      }
    } catch {
      // 사용자가 취소했거나 오류 → 복사로 fallback
    }
  
    // 2) Clipboard fallback
    try {
      await navigator.clipboard.writeText(opts.url);
      return "copied";
    } catch {
      return "failed";
    }
  }
  