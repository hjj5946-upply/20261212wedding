/**
 * 사진 위에 덮는 투명 레이어.
 *
 * 카카오 인앱 브라우저(Android WebView)는 길게 누르면 웹페이지가 아니라 앱이 직접
 * hit-test를 해서 "이미지 저장" 메뉴를 띄운다. 그래서 contextmenu preventDefault나
 * -webkit-touch-callout 만으로는 막히지 않는다.
 * 사진 위에 <img>가 아닌 요소를 한 장 덮으면 hit-test 결과가 이미지가 아니게 되어
 * 저장 메뉴 자체가 뜨지 않는다.
 *
 * 부모에 `relative`가 있어야 하고, 위에 얹을 UI(버튼 등)는 이 컴포넌트보다 뒤에
 * 렌더하거나 더 높은 z-index를 줘야 한다. 클릭은 부모로 그대로 버블링된다.
 */
export function PhotoGuard({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={["absolute inset-0 block select-none bg-transparent", className].join(" ")}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
