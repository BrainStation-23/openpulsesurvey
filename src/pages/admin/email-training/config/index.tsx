
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GradingCriteriaTab } from "./grading-criteria/GradingCriteriaTab";

export default function EmailTrainingConfig() {
  const navigate = useNavigate();
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Email Training Configuration</h1>
      </div>
      
      <Tabs defaultValue="grading-criteria">
        <TabsList>
          <TabsTrigger value="grading-criteria">Grading Criteria</TabsTrigger>
          {/* Add other email training configuration tabs here */}
        </TabsList>
        
        <TabsContent value="grading-criteria">
          <GradingCriteriaTab />
        </TabsContent>
        {/* Add other tab contents here */}
      </Tabs>
    </div>
  );
}
