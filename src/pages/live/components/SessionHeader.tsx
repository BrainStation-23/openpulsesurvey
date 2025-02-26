
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { ParticipantInfo } from "../types";

interface SessionHeaderProps {
  joinCode: string | undefined;
  participantInfo: ParticipantInfo | null;
}

export function SessionHeader({ joinCode, participantInfo }: SessionHeaderProps) {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="border-b bg-primary text-primary-foreground shrink-0">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Live Session</h1>
          <div className="px-3 py-1 bg-primary-foreground/10 rounded-md">
            Code: {joinCode}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Joined as: {participantInfo?.displayName}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary-foreground/10"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
