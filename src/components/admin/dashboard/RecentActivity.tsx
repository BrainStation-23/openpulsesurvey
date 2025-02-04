import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recent_activities")
        .select("*")
        .limit(5)
        .order("activity_time", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities?.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b pb-4 last:border-0"
              >
                <div>
                  <p className="font-medium">{activity.user_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Completed {activity.survey_name}
                  </p>
                </div>
                <time className="text-sm text-muted-foreground">
                  {new Date(activity.activity_time).toLocaleDateString()}
                </time>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}