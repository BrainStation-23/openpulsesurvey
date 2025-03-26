
import { useState, useEffect } from "react";
import { User } from "../../types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ManagementTabProps {
  user: User;
  supervisors: any[];
  onSupervisorChange: (supervisorId: string, action: "add" | "remove") => void;
  onPrimarySupervisorChange: (supervisorId: string) => void;
  readOnly?: boolean;
}

export function ManagementTab({
  user,
  supervisors,
  onSupervisorChange,
  onPrimarySupervisorChange,
  readOnly = false,
}: ManagementTabProps) {
  console.log('Rendering ManagementTab for user:', user?.id);
  console.log('Supervisors:', supervisors);
  
  const [supervisorSearchQuery, setSupervisorSearchQuery] = useState("");
  const [showSupervisorResults, setShowSupervisorResults] = useState(false);

  const { data: profilesData, isLoading: profilesLoading } = useQuery({
    queryKey: ["profiles", supervisorSearchQuery],
    queryFn: async () => {
      if (!supervisorSearchQuery.trim()) return [];

      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, profile_image_url")
        .or(`first_name.ilike.%${supervisorSearchQuery}%,last_name.ilike.%${supervisorSearchQuery}%`)
        .limit(10);

      if (error) throw error;
      
      // Filter out the current user and existing supervisors
      const existingSupervisorIds = supervisors.map(s => s.id);
      return data.filter(
        profile => profile.id !== user.id && !existingSupervisorIds.includes(profile.id)
      );
    },
    enabled: showSupervisorResults && supervisorSearchQuery.length > 2,
  });

  useEffect(() => {
    if (supervisorSearchQuery.length > 2) {
      setShowSupervisorResults(true);
    } else {
      setShowSupervisorResults(false);
    }
  }, [supervisorSearchQuery]);

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Management Chain</h3>
        <p className="text-sm text-muted-foreground">
          Configure the supervisors of this user.
        </p>
      </div>
      <Separator />

      {!readOnly && (
        <div className="pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for supervisors..."
              className="w-full px-4 py-2 border rounded-md"
              value={supervisorSearchQuery}
              onChange={(e) => setSupervisorSearchQuery(e.target.value)}
            />
            {showSupervisorResults && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {profilesLoading ? (
                  <div className="p-2 text-center text-gray-500">Loading...</div>
                ) : (
                  <>
                    {profilesData && profilesData.length > 0 ? (
                      profilesData.map((profile) => (
                        <div
                          key={profile.id}
                          className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            onSupervisorChange(profile.id, "add");
                            setSupervisorSearchQuery("");
                            setShowSupervisorResults(false);
                          }}
                        >
                          <span>
                            {profile.first_name} {profile.last_name}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-gray-500">
                        No results found
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {supervisors && supervisors.length > 0 ? (
        <div className="space-y-4">
          {supervisors.map((supervisor) => (
            <div
              key={supervisor.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center space-x-4">
                {supervisor.profile_image_url && (
                  <img
                    src={supervisor.profile_image_url}
                    alt={`${supervisor.first_name} ${supervisor.last_name}`}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {supervisor.first_name} {supervisor.last_name}
                  </p>
                  {supervisor.is_primary && (
                    <div className="mt-1 flex items-center text-sm text-green-600">
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Primary Supervisor
                    </div>
                  )}
                </div>
              </div>
              {!readOnly && (
                <div className="flex space-x-2">
                  {!supervisor.is_primary && supervisors.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrimarySupervisorChange(supervisor.id)}
                    >
                      Make Primary
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-red-500"
                    onClick={() => onSupervisorChange(supervisor.id, "remove")}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-muted-foreground">
          This user has no supervisors assigned.
        </div>
      )}
    </div>
  );
}
