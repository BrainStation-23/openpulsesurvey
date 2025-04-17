
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export function ComparePlaceholder() {
  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <ClipboardList className="h-6 w-6" />
          Campaign Comparison Feature
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground text-center max-w-md">
          The campaign comparison feature is currently being reimplemented. 
          This functionality will allow you to compare metrics and results across different campaign instances.
        </p>
      </CardContent>
    </Card>
  );
}
