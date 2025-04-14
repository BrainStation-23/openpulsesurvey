
import { RPCResponseItem } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface ResponseGroupProps {
  responses: RPCResponseItem[];
}

export function ResponseGroup({ responses }: ResponseGroupProps) {
  return (
    <div className="space-y-4">
      {responses.map((response) => (
        <Card key={response.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">
                  {response.user?.first_name} {response.user?.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">{response.user?.email}</p>
                
                {response.user?.user_sbus && response.user.user_sbus.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {response.user.user_sbus.find(sbu => sbu.is_primary)?.sbu.name || 
                     response.user.user_sbus[0].sbu.name}
                  </p>
                )}
              </div>
              
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
