
import { useEffect, useState } from "react";
import { Server, ServerCrash } from "lucide-react";

const HEALTH_ENDPOINT = "/api/health"; // Update this to your actual health/ping endpoint if needed

const ServerStatus = () => {
  const [status, setStatus] = useState<"up" | "down" | "checking">("checking");

  // Helper for pinging the backend
  const checkServer = async () => {
    setStatus("checking");
    try {
      // Try the health endpoint, fallback to `/` if 404
      let res = await fetch(HEALTH_ENDPOINT, { cache: "no-store" });
      if (!res.ok && res.status === 404) {
        res = await fetch("/", { cache: "no-store" });
      }
      if (res.ok) setStatus("up");
      else setStatus("down");
    } catch (e) {
      setStatus("down");
    }
  };

  useEffect(() => {
    checkServer();
    // Poll every 30s
    const interval = setInterval(checkServer, 30000);
    return () => clearInterval(interval);
  }, []);

  let content, color, icon;
  if (status === "up") {
    icon = <Server className="w-5 h-5 text-green-400 animate-pulse" />;
    color = "text-green-400";
    content = <>Backend: <span className={color}>Connected</span></>;
  } else if (status === "down") {
    icon = <ServerCrash className="w-5 h-5 text-red-400 animate-bounce" />;
    color = "text-red-400";
    content = <>Backend: <span className={color}>Server Down</span></>;
  } else {
    icon = <Server className="w-5 h-5 text-yellow-400 animate-spin" />;
    color = "text-yellow-400";
    content = <>Backend: <span className={color}>Checking...</span></>;
  }

  return (
    <div className={`flex items-center bg-neutral-900/80 px-4 py-2 rounded-full shadow-lg border border-neutral-700 text-white gap-2 text-sm font-medium backdrop-blur animate-fade-in`}>
      {icon}
      <span className="ml-1">{content}</span>
    </div>
  );
};

export default ServerStatus;
