
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useServerPptxExport } from "../hooks/useServerPptxExport";
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";
import { CampaignData } from "../types";
import { COMPARISON_DIMENSIONS } from "../constants";
import { ComparisonDimension } from "../types/comparison";

// Map dimension keys to display names
const DIMENSION_LABELS: Record<string, string> = {
  'sbu': 'Business Unit',
  'gender': 'Gender',
  'location': 'Location',
  'employment_type': 'Employment Type',
  'level': 'Level',
  'employee_type': 'Employee Type',
  'employee_role': 'Employee Role',
  'supervisor': 'Supervisor'
};

interface ExportOptionsDialogProps {
  campaign: CampaignData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExportOptionsDialog({ campaign, open, onOpenChange }: ExportOptionsDialogProps) {
  const { handleExport, exporting, progress } = useServerPptxExport();
  
  // Export configuration state
  const [config, setConfig] = useState({
    dimensions: [...COMPARISON_DIMENSIONS],
    includeTitle: true,
    includeCompletionRate: true,
    includeResponseTrends: true,
    includeTextResponses: true,
    fileName: `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_presentation`,
    company: "Your Company",
    author: "Survey System"
  });
  
  // Handle checkbox changes for dimensions
  const handleDimensionToggle = (dimension: ComparisonDimension) => {
    setConfig(prev => ({
      ...prev,
      dimensions: prev.dimensions.includes(dimension)
        ? prev.dimensions.filter(d => d !== dimension)
        : [...prev.dimensions, dimension]
    }));
  };
  
  // Handle checkbox changes for content options
  const handleContentOptionChange = (option: keyof typeof config) => {
    setConfig(prev => ({
      ...prev,
      [option]: !prev[option as keyof typeof config]
    }));
  };
  
  // Handle input changes
  const handleInputChange = (field: keyof typeof config, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Trigger the export
  const handleStartExport = async () => {
    await handleExport(campaign, campaign.instance?.id, {
      dimensions: config.dimensions.map(d => d.toString()),
      includeTitle: config.includeTitle,
      includeCompletionRate: config.includeCompletionRate,
      includeResponseTrends: config.includeResponseTrends,
      includeTextResponses: config.includeTextResponses,
      fileName: `${config.fileName}.pptx`,
      company: config.company,
      author: config.author
    });
    
    if (!exporting) {
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Presentation</DialogTitle>
          <DialogDescription>
            Configure your presentation export options
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="content">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="metadata">File Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Slides to Include</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTitle" 
                    checked={config.includeTitle}
                    onCheckedChange={() => handleContentOptionChange('includeTitle')}
                  />
                  <Label htmlFor="includeTitle">Title slide</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeCompletionRate" 
                    checked={config.includeCompletionRate}
                    onCheckedChange={() => handleContentOptionChange('includeCompletionRate')}
                  />
                  <Label htmlFor="includeCompletionRate">Completion rate slide</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeResponseTrends" 
                    checked={config.includeResponseTrends}
                    onCheckedChange={() => handleContentOptionChange('includeResponseTrends')}
                  />
                  <Label htmlFor="includeResponseTrends">Response trends slide</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="includeTextResponses" 
                    checked={config.includeTextResponses}
                    onCheckedChange={() => handleContentOptionChange('includeTextResponses')}
                  />
                  <Label htmlFor="includeTextResponses">Text responses</Label>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Comparison Dimensions</h3>
              <div className="grid grid-cols-2 gap-2">
                {COMPARISON_DIMENSIONS.map(dimension => (
                  <div key={dimension} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`dimension-${dimension}`}
                      checked={config.dimensions.includes(dimension)}
                      onCheckedChange={() => handleDimensionToggle(dimension)}
                    />
                    <Label htmlFor={`dimension-${dimension}`}>{DIMENSION_LABELS[dimension] || dimension}</Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="metadata" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">File name</Label>
                <Input 
                  id="fileName" 
                  value={config.fileName} 
                  onChange={(e) => handleInputChange('fileName', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company name</Label>
                <Input 
                  id="company" 
                  value={config.company} 
                  onChange={(e) => handleInputChange('company', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input 
                  id="author" 
                  value={config.author} 
                  onChange={(e) => handleInputChange('author', e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {exporting && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-center text-muted-foreground">
              Generating presentation... {progress}%
            </p>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleStartExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              "Export to PPTX"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
