
import { RPCResponseItem } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ResponseGroupProps {
  responses: RPCResponseItem[];
  onViewResponse: (response: RPCResponseItem) => void;
}

export function ResponseGroup({ responses, onViewResponse }: ResponseGroupProps) {
  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <Card key={response.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                {response.campaign_anonymous ? (
                  <h3 className="font-medium">Anonymous</h3>
                ) : (
                  <>
                    <h3 className="font-medium">
                      {response.user?.first_name} {response.user?.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{response.user?.email}</p>
                  </>
                )}
                
                {response.primary_sbu_name && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">SBU:</span> {response.primary_sbu_name}
                  </p>
                )}
                
                {response.primary_supervisor_name && (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Manager:</span> {response.primary_supervisor_name}
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => onViewResponse(response)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs 
                    ${response.status === 'submitted' ? 'bg-green-100 text-green-800' : 
                     response.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                     'bg-gray-100 text-gray-800'}`}>
                    {response.status}
                  </span>
                  
                  {response.submitted_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted {formatDistanceToNow(new Date(response.submitted_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
