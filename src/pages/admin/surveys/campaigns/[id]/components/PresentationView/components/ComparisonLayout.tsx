
import { cn } from "@/lib/utils";

interface ComparisonLayoutProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function ComparisonLayout({ children, title, className }: ComparisonLayoutProps) {
  return (
    <div className={cn("w-full max-w-[1400px] mx-auto p-4", className)}>
      {title && (
        <h3 className="text-lg font-semibold mb-6 text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
