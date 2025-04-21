
import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";

export function KeyboardShortcutsHint({ onClose }: { onClose: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 8000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed z-50 bottom-8 left-1/2 -translate-x-1/2 bg-black text-white rounded shadow-lg px-4 py-2 flex gap-2 items-center animate-fade-in">
      <Info className="h-4 w-4 text-blue-300 mr-2" />
      <span>
        Use <kbd className="px-1 bg-white text-black rounded">←→</kbd> or swipe to navigate, <kbd className="px-1 bg-white text-black rounded">F</kbd> for fullscreen, <kbd className="px-1 bg-white text-black rounded">N</kbd> for notes, <kbd className="px-1 bg-white text-black rounded">J</kbd> to jump, <kbd className="px-1 bg-white text-black rounded">O</kbd> for overview, <kbd className="px-1 bg-white text-black rounded">Z</kbd> to zoom.
      </span>
      <button className="ml-3 text-xs underline" onClick={() => { setVisible(false); onClose(); }}>Hide</button>
    </div>
  );
}
