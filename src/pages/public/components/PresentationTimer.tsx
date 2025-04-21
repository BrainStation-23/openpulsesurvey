
import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function PresentationTimer({ running }: { running: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!running) return;
    const intv = setInterval(() => setElapsed((t) => t + 1), 1000);
    return () => clearInterval(intv);
  }, [running]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono bg-white/70 px-2 py-1 rounded">
      <Clock className="h-4 w-4 mr-1" />
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}
