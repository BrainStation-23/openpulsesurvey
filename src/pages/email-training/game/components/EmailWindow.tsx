
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { Scenario } from "../../admin/email-training/scenarios/types";

interface EmailWindowProps {
  scenario: Scenario;
  onComplete: () => void;
}

export function EmailWindow({ scenario, onComplete }: EmailWindowProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Interface</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner className="w-8 h-8" />
          </div>
        ) : (
          <div>
            {/* Email interface will be implemented in the next step */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
