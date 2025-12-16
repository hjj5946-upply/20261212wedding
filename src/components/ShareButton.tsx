import { Button } from "./Button";

export function ShareButton({
  onClick,
  label = "청첩장 공유하기",
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <Button variant="secondary" onClick={onClick}>
      {label}
    </Button>
  );
}
