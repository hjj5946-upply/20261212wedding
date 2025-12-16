import { useMemo, useState } from "react";
import { Invitation } from "./pages/Invitation";
import { IntroHost } from "./intro/IntroHost";

function getIntroOption(): 1 | 2 | 3 {
  const params = new URLSearchParams(window.location.search);
  const v = params.get("intro");
  if (v === "2") return 2;
  if (v === "3") return 3;
  return 3;
}

function isNoIntro(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.get("noIntro") === "1";
}

export default function App() {
  const option = useMemo(() => getIntroOption(), []);
  const [introDone, setIntroDone] = useState(false);

  if (isNoIntro()) {
    return <Invitation />;
  }

  return (
    <>
      {!introDone && <IntroHost option={option} onDone={() => setIntroDone(true)} />}
      {introDone && <Invitation />}
    </>
  );
}
