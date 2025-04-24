
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignInstance } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, ArrowRight, Check, AlertTriangle, CheckCircle } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from 'react-markdown';
import { useState } from "react";

interface ActionItemsTabProps {
  campaignId: string;
  instances: CampaignInstance[];
}

export function ActionItemsTab({ campaignId, instances }: ActionItemsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("action_items");
  
  const { data: actionItems, isLoading } = useQuery({
    queryKey: ["campaign-action-items", campaignId, instances?.map(i => i.id).join(",")],
    queryFn: async () => {
      // Get analysis prompts for various categories
      const { data: prompts, error: promptsError } = await supabase
        .from("analysis_prompts")
        .select("*")
        .eq("status", "active");
        
      if (promptsError) throw promptsError;
      
      // In a real implementation, you'd use these prompts to generate 
      // AI recommendations based on actual survey data
      // This is a simulated implementation
      
      // Mock data for demonstration
      const mockActionItems = [
        {
          id: 1,
          title: "Improve Communication Channels",
          description: "Establish clearer communication channels between departments. Survey results show 68% of respondents feel information doesn't flow efficiently.",
          priority: "high",
          category: "action_items",
          status: "pending"
        },
        {
          id: 2,
          title: "Address Work-Life Balance Concerns",
          description: "Multiple responses indicate burnout risk. Schedule team discussions on workload management and consider flexible scheduling options.",
          priority: "medium",
          category: "action_items",
          status: "in_progress"
        },
        {
          id: 3,
          title: "Recognition Program Review",
          description: "Employee recognition scored below benchmark (2.3/5). Review and enhance the current recognition program to acknowledge achievements more effectively.",
          priority: "medium",
          category: "action_items",
          status: "completed"
        },
        {
          id: 4,
          title: "Management Training",
          description: "Implement targeted training for managers with below-average scores in the 'leadership' category.",
          priority: "high",
          category: "action_items",
          status: "pending"
        }
      ];
      
      const mockRecommendations = [
        {
          id: 5,
          title: "Demographic Analysis",
          content: `## Key Insights from Demographic Analysis

* **Location-based Disparities**: Remote employees show 18% lower engagement scores compared to on-site staff
* **Experience Level Gap**: Junior staff (0-2 years) report 25% higher satisfaction than mid-level employees (3-5 years)
* **Department Variation**: Marketing and Sales show highest engagement (4.2/5), while Operations shows lowest (3.1/5)

### Recommended Actions:

1. Establish targeted focus groups with remote employees to identify specific needs
2. Develop career progression resources specifically for mid-level employees
3. Share best practices from high-performing departments with lower-scoring teams`,
          category: "demographic_insights"
        },
        {
          id: 6,
          title: "General Survey Performance",
          content: `## Overall Survey Performance

* **Response Rate**: 78% (↑12% from previous campaign)
* **Completion Rate**: 92% of started surveys were completed
* **Question Effectiveness**: "Manager Support" questions showed highest discrimination value
* **Key Areas of Strength**: Team collaboration (4.3/5), Company mission alignment (4.1/5)
* **Key Areas for Improvement**: Career development (2.8/5), Feedback processes (3.0/5)

### Recommendations:

1. Continue using the high-engagement question format from this survey in future campaigns
2. Implement a task force focused on career development opportunities
3. Review and revise feedback mechanisms across all departments`,
          category: "general_analysis"
        },
        {
          id: 7,
          title: "Improvement Roadmap",
          content: `## Strategic Improvement Roadmap

### Immediate Priorities (Next 30 Days)
* Address critical communication gaps in the Operations department
* Schedule focus groups with remote employees to identify specific needs
* Implement quick-win recognition processes at the team level

### Medium-term Actions (1-3 Months)
* Develop manager training program focused on feedback delivery
* Create career development workshops for mid-level employees
* Establish cross-departmental knowledge sharing sessions

### Long-term Initiatives (3-6 Months)
* Complete organizational communication review
* Design comprehensive career progression framework
* Implement enhanced performance management system`,
          category: "improvement_suggestions"
        },
        {
          id: 8,
          title: "Response Pattern Analysis",
          content: `## Response Pattern Deep Dive

* **Key Theme**: Workload distribution emerged as a persistent concern across all departments
* **Positive Trend**: Communication scores improved by 14% from the previous survey
* **Concerning Pattern**: 62% of respondents feel career growth opportunities are limited
* **Time-based Pattern**: Morning responses (8-11am) were consistently more positive than afternoon responses

### Action Items:
1. Review workload distribution mechanisms across teams
2. Continue communication improvement initiatives that are showing results
3. Conduct career pathing workshops with management and employees
4. Schedule important announcements and meetings in morning hours when engagement is higher`,
          category: "response_patterns"
        }
      ];
      
      return {
        actionItems: mockActionItems,
        recommendations: mockRecommendations,
        prompts
      };
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (!actionItems) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No action items or recommendations available</p>
      </div>
    );
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "orange";
      case "low": return "blue";
      default: return "secondary";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress": return <ArrowRight className="h-5 w-5 text-blue-500" />;
      case "pending": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-muted-foreground" />;
    }
  };
  
  const filteredRecommendations = actionItems.recommendations.filter(
    rec => rec.category === selectedCategory
  );
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="action-items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="action-items">Action Items</TabsTrigger>
          <TabsTrigger value="ai-recommendations">AI Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="action-items" className="space-y-6">
          {/* Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Action Items Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Overall Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm text-muted-foreground">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                </div>
                
                {/* Status Breakdown */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Pending</span>
                    </div>
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-blue-500">
                      <ArrowRight className="h-4 w-4" />
                      <span className="font-medium">In Progress</span>
                    </div>
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 text-green-500">
                      <Check className="h-4 w-4" />
                      <span className="font-medium">Completed</span>
                    </div>
                    <span className="text-2xl font-bold">1</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Items List */}
          <div className="space-y-4">
            {actionItems.actionItems.map((item) => (
              <Card key={item.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {item.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {item.description}
                    </CardDescription>
                  </div>
                  <Badge variant={getPriorityColor(item.priority) as any}>
                    {item.priority} priority
                  </Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-end">
                    {item.status === "completed" ? (
                      <Button variant="ghost" disabled>
                        <Check className="h-4 w-4 mr-2" />
                        Completed
                      </Button>
                    ) : (
                      <Button variant="outline">
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {item.status === "in_progress" ? "Update Status" : "Start Action"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="ai-recommendations" className="space-y-6">
          {/* AI Analysis Categories */}
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {actionItems.prompts.map((prompt) => (
                  <Button 
                    key={prompt.id}
                    variant={selectedCategory === prompt.category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(prompt.category)}
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {prompt.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recommendations */}
          <div className="space-y-4">
            {filteredRecommendations.map((recommendation) => (
              <Card key={recommendation.id} className="prose prose-sm max-w-none">
                <CardHeader className="pb-0">
                  <CardTitle>
                    <Lightbulb className="h-5 w-5 text-yellow-500 inline mr-2" />
                    {recommendation.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReactMarkdown>
                    {recommendation.content}
                  </ReactMarkdown>
                </CardContent>
              </Card>
            ))}
            
            {filteredRecommendations.length === 0 && (
              <div className="flex items-center justify-center h-40 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No recommendations available for this category</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
