
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
  const calculateStats = (response: RPCResponseItem) => {
    if (!response.response_data) return null;

    const ratings = Object.values(response.response_data)
      .filter((value): value is number => 
        typeof value === 'number' && value >= 1 && value <= 5
      );

    if (ratings.length === 0) return null;

    // Calculate average
    const avg = ratings.reduce((sum, val) => sum + val, 0) / ratings.length;
    
    // Calculate median
    const sorted = [...ratings].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

    return {
      average: avg.toFixed(1),
      median: median.toFixed(1)
    };
  };

  return (
    <div className="space-y-4">
      {responses.map((response) => {
        const stats = calculateStats(response);
        
        return (
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

                  {stats && (
                    <div className="flex gap-4 mt-2">
                      <p className="text-xs">
                        <span className="font-medium text-blue-600">Avg Rating:</span> {stats.average}
                      </p>
                      <p className="text-xs">
                        <span className="font-medium text-purple-600">Median Rating:</span> {stats.median}
                      </p>
                    </div>
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
        );
      })}
    </div>
  );
}
