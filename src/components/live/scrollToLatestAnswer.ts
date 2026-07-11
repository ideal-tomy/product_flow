/**
 * スクロールコンテナ内の最新スレッドアンカー（回答／質問ターン先頭）を表示域の上端へ。
 */
export function scrollToLatestThreadAnchor(
  container: HTMLElement | null,
  behavior: ScrollBehavior = "smooth",
): void {
  if (!container) return;

  const run = () => {
    const anchors = container.querySelectorAll<HTMLElement>(
      "[data-thread-anchor]",
    );
    const last = anchors[anchors.length - 1];
    if (!last) return;
    last.scrollIntoView({ block: "start", behavior, inline: "nearest" });
  };

  requestAnimationFrame(() => {
    requestAnimationFrame(run);
  });
}
