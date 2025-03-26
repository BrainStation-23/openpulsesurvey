
import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { useSBUManagement } from "../../hooks/useSBUManagement";
import { User } from "../../types";
import { Separator } from "@/components/ui/separator";

interface SBUAssignmentTabProps {
  user: User;
  readOnly?: boolean;
}

export function SBUAssignmentTab({ user, readOnly = false }: SBUAssignmentTabProps) {
  console.log('Rendering SBUAssignmentTab for user:', user?.id);
  const startTime = performance.now();
  
  const {
    userSBUs,
    sbus,
    primarySBU,
  } = useSBUManagement(user);

  useEffect(() => {
    const renderTime = performance.now() - startTime;
    console.log(`SBUAssignmentTab render took ${renderTime.toFixed(2)}ms`);
    console.log('SBU data loaded:', { 
      userSBUsCount: userSBUs?.length || 0, 
      sbusCount: sbus?.length || 0,
      primarySBU 
    });
  }, [startTime, userSBUs, sbus, primarySBU]);

  if (!userSBUs) {
    return <div className="py-4">Loading SBU information...</div>;
  }

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">SBU Assignments</h3>
        <p className="text-sm text-muted-foreground">
          The Strategic Business Units (SBUs) this user is assigned to.
        </p>
      </div>
      <Separator />

      {userSBUs.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          This user is not assigned to any SBUs.
        </div>
      ) : (
        <div className="space-y-4">
          {userSBUs.map((userSBU) => (
            <div
              key={userSBU.sbu_id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center space-x-3">
                <div>
                  <p className="font-medium">{userSBU.sbu?.name}</p>
                  {userSBU.is_primary && (
                    <div className="mt-1 flex items-center text-sm text-green-600">
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Primary SBU
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
