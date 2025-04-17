import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function InstanceCompareTab() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Alert className="max-w-2xl">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle className="ml-2">Campaign Comparison</AlertTitle>
        <AlertDescription>
          The campaign comparison feature is currently being reimplemented.
          This functionality will be available in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}