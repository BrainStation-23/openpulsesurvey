
import { Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Scenario } from "../../../../types";
import { GeneratedEmail } from "../../types";

interface MailLayoutProps {
  scenario: Scenario;
  email: GeneratedEmail | null;
  isLoading: boolean;
  children: React.ReactNode;
}

export function MailLayout({ scenario, email, isLoading, children }: MailLayoutProps) {
  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-full max-h-[800px] items-stretch"
    >
      <ResizablePanel defaultSize={25} minSize={20}>
        <div className="flex h-full flex-col">
          <div className="flex h-[52px] items-center justify-between px-4 py-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <h3 className="text-lg font-semibold">Training</h3>
            </div>
          </div>
          <Separator />
          <ScrollArea className="flex-1">
            <div className="space-y-1 p-2">
              <button
                className={cn(
                  "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent",
                  "bg-accent"
                )}
              >
                <Mail className="h-4 w-4" />
                Current Scenario
              </button>
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>
      <ResizablePanel defaultSize={75}>
        <div className="flex h-full flex-col">
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
