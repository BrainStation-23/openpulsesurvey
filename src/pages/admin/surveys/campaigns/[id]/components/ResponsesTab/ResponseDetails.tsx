
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import type { Response, RPCResponseItem } from "./types";

interface ResponseDetailsProps {
  response: Response | RPCResponseItem | null;
  onClose: () => void;
}

export function ResponseDetails({ response, onClose }: ResponseDetailsProps) {
  const formatAnswer = (value: any) => {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc pl-4">
          {value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return value;
  };

  if (!response) return null;
  
  // Determine if the response is anonymous
  const isAnonymous = 'assignment' in response && response.assignment?.campaign?.anonymous 
    ? response.assignment.campaign.anonymous 
    : ('campaign_anonymous' in response ? response.campaign_anonymous : false);

  // Get respondent information
  let respondentName = "Anonymous";
  if (!isAnonymous) {
    if ('user' in response && response.user) {
      respondentName = response.user.first_name && response.user.last_name 
        ? `${response.user.first_name} ${response.user.last_name}` 
        : response.user.email;
    } else if ('user_id' in response) {
      // For RPCResponseItem with user property
      respondentName = response.user?.first_name && response.user?.last_name 
        ? `${response.user.first_name} ${response.user.last_name}` 
        : (response.user?.email || "Unknown User");
    }
  }
        
  // Get primary SBU
  const primarySBU = response.primary_sbu_name || 
    ('user' in response && response.user.user_sbus
      ? response.user.user_sbus.find(us => us.is_primary)?.sbu.name || "N/A"
      : "N/A");
    
  // Get primary supervisor
  const primarySupervisor = response.primary_supervisor_name || 
    ('user' in response && response.user.user_supervisors
      ? (() => {
          const supervisor = response.user.user_supervisors.find(us => us.is_primary)?.supervisor;
          return supervisor?.first_name && supervisor?.last_name 
            ? `${supervisor.first_name} ${supervisor.last_name}` 
            : "N/A";
        })()
      : "N/A");

  return (
    <Sheet open={!!response} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Response Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Respondent
            </h3>
            <p>{respondentName}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Primary SBU
            </h3>
            <p>{primarySBU}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Primary Manager
            </h3>
            <p>{primarySupervisor}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Submitted At
            </h3>
            <p>
              {response.submitted_at
                ? format(new Date(response.submitted_at), "PPp")
                : "Not submitted"}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Responses
            </h3>
            <div className="border rounded-lg divide-y">
              {Object.entries(response.response_data).map(([question, answer]) => (
                <div key={question} className="p-4">
                  <div className="font-medium mb-2">{question}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatAnswer(answer)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
