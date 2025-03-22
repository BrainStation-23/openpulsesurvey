
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useOKRCycles } from '@/hooks/okr/useOKRCycles';
import { useObjectives } from '@/hooks/okr/useObjectives';
import { Objective, ObjectiveStatus } from '@/types/okr';
import { Progress } from "@/components/ui/progress";
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, CheckCircle, AlertCircle, ClockIcon, BarChart as BarChartIcon } from 'lucide-react';
import { format } from 'date-fns';

const AdminOKRDashboard = () => {
  const { cycles, isLoading: cyclesLoading } = useOKRCycles();
  const { objectives, isLoading: objectivesLoading } = useObjectives();
  
  const activeCycle = cycles?.find(cycle => cycle.status === 'active');
  const cycleObjectives = objectives?.filter(obj => obj.cycleId === activeCycle?.id) || [];
  
  const statusCounts = getStatusCounts(cycleObjectives);
  const progressDistribution = getProgressDistribution(cycleObjectives);
  const statusData = getStatusData(statusCounts);
  const progressData = getProgressData(progressDistribution);
  
  const completionRate = calculateCompletionRate(cycleObjectives);
  const atRiskCount = statusCounts['at_risk'] || 0;
  const completedCount = statusCounts['completed'] || 0;
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">OKRs Dashboard</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Cycle"
          value={activeCycle ? activeCycle.name : "None"}
          description={activeCycle ? `${format(new Date(activeCycle.startDate), 'PP')} - ${format(new Date(activeCycle.endDate), 'PP')}` : "No active cycle"}
          icon={CalendarIcon}
          loading={cyclesLoading}
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Objectives completed"
          icon={CheckCircle}
          loading={objectivesLoading}
        />
        <MetricCard
          title="At Risk"
          value={atRiskCount.toString()}
          description="Objectives at risk"
          icon={AlertCircle}
          loading={objectivesLoading}
          valueClassName="text-destructive"
        />
        <MetricCard
          title="Completed"
          value={completedCount.toString()}
          description="Objectives completed"
          icon={CheckCircle}
          loading={objectivesLoading}
          valueClassName="text-green-500"
        />
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Objective Status</CardTitle>
                <CardDescription>Distribution of objectives by status</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getStatusColor(entry.id)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} objectives`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Progress Distribution</CardTitle>
                <CardDescription>Objective progress breakdown</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} objectives`, 'Count']} />
                    <Legend />
                    <Bar dataKey="value" name="Objectives" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="objectives">
          <Card>
            <CardHeader>
              <CardTitle>Current Objectives</CardTitle>
              <CardDescription>
                {activeCycle ? `Showing objectives for ${activeCycle.name}` : 'No active cycle found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {objectivesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="p-4 animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-4"></div>
                      <div className="h-2 bg-muted rounded w-full"></div>
                    </Card>
                  ))}
                </div>
              ) : cycleObjectives.length > 0 ? (
                <div className="space-y-4">
                  {cycleObjectives.map(objective => (
                    <ObjectiveCard key={objective.id} objective={objective} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No objectives found for the current cycle.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MetricCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  loading = false,
  valueClassName = ""
}) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className={`text-2xl font-bold mt-1 ${valueClassName}`}>
              {loading ? (
                <div className="h-8 w-24 bg-muted rounded animate-pulse"></div>
              ) : (
                value
              )}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="rounded-full p-2 bg-muted">
            <Icon className="h-6 w-6 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ObjectiveCard = ({ objective }: { objective: Objective }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{objective.title}</h3>
            <StatusBadge status={objective.status} />
          </div>
          
          {objective.description && (
            <p className="text-sm text-muted-foreground">{objective.description}</p>
          )}
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium">Progress: {Math.round(objective.progress)}%</span>
            </div>
            <Progress value={objective.progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatusBadge = ({ status }: { status: ObjectiveStatus }) => {
  let color = '';
  
  switch (status) {
    case 'completed':
      color = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      break;
    case 'at_risk':
      color = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      break;
    case 'on_track':
      color = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      break;
    case 'in_progress':
      color = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      break;
    default:
      color = 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
  }
  
  return (
    <Badge variant="outline" className={color}>
      {formatStatus(status)}
    </Badge>
  );
};

// Helper functions
const formatStatus = (status: ObjectiveStatus): string => {
  switch (status) {
    case 'in_progress': return 'In Progress';
    case 'at_risk': return 'At Risk';
    case 'on_track': return 'On Track';
    case 'completed': return 'Completed';
    default: return 'Draft';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'draft': return '#CBD5E1';
    case 'in_progress': return '#FCD34D';
    case 'at_risk': return '#EF4444';
    case 'on_track': return '#3B82F6';
    case 'completed': return '#10B981';
    default: return '#CBD5E1';
  }
};

const getStatusCounts = (objectives: Objective[]) => {
  return objectives.reduce((acc, obj) => {
    acc[obj.status] = (acc[obj.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

const getProgressDistribution = (objectives: Objective[]) => {
  const distribution = {
    '0-25': 0,
    '26-50': 0,
    '51-75': 0,
    '76-99': 0,
    '100': 0
  };
  
  objectives.forEach(obj => {
    if (obj.progress === 100) {
      distribution['100']++;
    } else if (obj.progress >= 76) {
      distribution['76-99']++;
    } else if (obj.progress >= 51) {
      distribution['51-75']++;
    } else if (obj.progress >= 26) {
      distribution['26-50']++;
    } else {
      distribution['0-25']++;
    }
  });
  
  return distribution;
};

const getStatusData = (statusCounts: Record<string, number>) => {
  return Object.entries(statusCounts).map(([key, value]) => ({
    id: key,
    name: formatStatus(key as ObjectiveStatus),
    value
  }));
};

const getProgressData = (progressDistribution: Record<string, number>) => {
  return Object.entries(progressDistribution).map(([key, value]) => ({
    name: key + '%',
    value
  }));
};

const calculateCompletionRate = (objectives: Objective[]) => {
  if (objectives.length === 0) return 0;
  
  const completedCount = objectives.filter(obj => obj.status === 'completed').length;
  return Math.round((completedCount / objectives.length) * 100);
};

export default AdminOKRDashboard;
