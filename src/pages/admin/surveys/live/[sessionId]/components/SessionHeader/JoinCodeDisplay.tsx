
interface JoinCodeDisplayProps {
  code: string;
}

export function JoinCodeDisplay({ code }: JoinCodeDisplayProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Join Code:</span>
      <span className="font-mono text-lg font-semibold">{code}</span>
    </div>
  );
}
