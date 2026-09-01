// interfaces

interface EmptyHintProps {
  text: string;
}

export function EmptyHint({ text }: EmptyHintProps) {
  return <p className="mt-4 text-sm text-muted-foreground">{text}</p>;
}
