
import { Server } from "lucide-react";

const ServerStatus = () => {
  // In production, this could be dynamic. For now, always show "Connected"
  return (
    <div className="flex items-center bg-neutral-900/80 px-4 py-2 rounded-full shadow-lg border border-neutral-700 text-white gap-2 text-sm font-medium backdrop-blur animate-fade-in">
      <Server className="w-5 h-5 text-green-400 animate-pulse" />
      <span className="ml-1">Backend: <span className="text-green-400">Connected</span></span>
    </div>
  );
};

export default ServerStatus;
