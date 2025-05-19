
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { MessageSquare, BarChart, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function FeedbackDashboardPage() {
  const { user } = useCurrentUser();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Feedback Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reportee Feedback</CardTitle>
            <CardDescription>
              View and manage feedback for your team members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Access feedback data, track progress, and identify improvement areas for your direct reportees.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link to="/user/feedback/reportee">
                <MessageSquare className="mr-2 h-4 w-4" />
                View Reportee Feedback
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feedback Trends</CardTitle>
            <CardDescription>
              Visualize feedback trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track how feedback from your team changes across multiple survey periods to identify long-term patterns.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link to="/user/feedback/trend">
                <LineChart className="mr-2 h-4 w-4" />
                View Feedback Trends
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
