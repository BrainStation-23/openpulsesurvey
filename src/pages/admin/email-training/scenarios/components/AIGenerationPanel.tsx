
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { supabase } from "@/integrations/supabase/client";

interface AIGenerationPanelProps {
  onGenerate: (generatedContent: {
    name: string;
    story: string;
    difficulty_level: number;
    tags: string[];
  }) => void;
  disabled?: boolean;
}

export function AIGenerationPanel({ onGenerate, disabled }: AIGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState("");
  const [scenarioType, setScenarioType] = useState("");
  const [complexity, setComplexity] = useState("intermediate");
  const [situation, setSituation] = useState("");

  const handleGenerate = async () => {
    if (!topic || !scenarioType) {
      toast.error("Please fill in required fields (Topic and Scenario Type)");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-scenario', {
        body: {
          topic,
          scenarioType,
          complexity,
          situation,
        },
      });

      if (error) throw error;
      onGenerate(data);
      toast.success("Scenario generated successfully!");
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Failed to generate scenario. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h3 className="text-lg font-semibold">AI Generation Settings</h3>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic/Industry*</Label>
          <Input
            id="topic"
            placeholder="e.g., Sales, Customer Service, IT"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="scenarioType">Scenario Type*</Label>
          <Select value={scenarioType} onValueChange={setScenarioType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email_etiquette">Email Etiquette</SelectItem>
              <SelectItem value="client_communication">Client Communication</SelectItem>
              <SelectItem value="internal_communication">Internal Communication</SelectItem>
              <SelectItem value="conflict_resolution">Conflict Resolution</SelectItem>
              <SelectItem value="sales_communication">Sales Communication</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Complexity</Label>
        <RadioGroup
          value={complexity}
          onValueChange={setComplexity}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="beginner" id="beginner" />
            <Label htmlFor="beginner">Beginner</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="intermediate" id="intermediate" />
            <Label htmlFor="intermediate">Intermediate</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="advanced" id="advanced" />
            <Label htmlFor="advanced">Advanced</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="situation">Specific Situation (Optional)</Label>
        <Textarea
          id="situation"
          placeholder="Describe a specific situation or context..."
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          className="h-20"
        />
      </div>

      <Button
        onClick={handleGenerate}
        disabled={disabled || isGenerating || !topic || !scenarioType}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <LoadingSpinner className="mr-2" />
            Generating...
          </>
        ) : (
          <>
            <Wand2 className="mr-2" />
            Generate Scenario
          </>
        )}
      </Button>
    </div>
  );
}
