
import React from "react";

export function NotesPanel({
  visible,
  notes,
  onChange,
  onClose
}: {
  visible: boolean;
  notes: string;
  onChange: (val: string) => void;
  onClose: () => void;
}) {
  if (!visible) return null;

  return (
    <aside className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-[min(95vw,520px)] bg-background border-t shadow-2xl p-4 rounded-t animate-slide-in-right">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold">Slide Notes</span>
        <button className="text-xs underline opacity-70" onClick={onClose}>Close</button>
      </div>
      <textarea
        className="w-full min-h-[80px] text-sm rounded border px-2 py-1"
        value={notes}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write notes for this slide..."
      />
    </aside>
  );
}
