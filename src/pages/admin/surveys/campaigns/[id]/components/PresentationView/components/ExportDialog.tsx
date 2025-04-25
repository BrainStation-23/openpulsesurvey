
import React, { useState } from "react";
import { CampaignData } from "../types";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { exportToPptx } from "../services/pptxExport/exportService";
import { DEFAULT_EXPORT_CONFIG, PptxExportConfig } from "../services/pptxExport/types";
import { useToast } from "@/hooks/use-toast";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: CampaignData;
  instanceId?: string;
}

const DIMENSION_OPTIONS = [
  { id: "sbu", label: "Strategic Business Unit" },
  { id: "gender", label: "Gender" },
  { id: "location", label: "Location" },
  { id: "employment_type", label: "Employment Type" },
  { id: "level", label: "Level" },
  { id: "employee_type", label: "Employee Type" },
  { id: "employee_role", label: "Employee Role" }
];

export function ExportDialog({ open, onOpenChange, campaign, instanceId }: ExportDialogProps) {
  const { toast } = useToast();

  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("content");
  const [error, setError] = useState<string | null>(null);

  // Export configuration state
  const [config, setConfig] = useState<PptxExportConfig>({ ...DEFAULT_EXPORT_CONFIG });

  const handleExport = async () => {
    setError(null);
    
    try {
      // Validate instance ID
      if (!campaign.instance?.id && !instanceId) {
        setError("No instance ID available. Please try again or contact support.");
        return;
      }
      
      setExporting(true);
      
      await exportToPptx(campaign, instanceId, {
        ...config,
        onProgress: (progress) => setProgress(progress)
      });
      
      toast({
        title: "Export complete",
        description: "Your presentation has been successfully exported.",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Export error:", error);
      
      // Set a user-friendly error message
      setError(
        error.message || 
        "There was an error exporting your presentation. Please try again later or contact support."
      );
      
      toast({
        title: "Export failed",
        description: "There was an error exporting your presentation.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
      setProgress(0);
    }
  };

  const toggleDimension = (dimensionId: string) => {
    setConfig(prev => {
      if (prev.dimensions.includes(dimensionId)) {
        return {
          ...prev,
          dimensions: prev.dimensions.filter(d => d !== dimensionId)
        };
      } else {
        return {
          ...prev,
          dimensions: [...prev.dimensions, dimensionId]
        };
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Presentation</DialogTitle>
          <DialogDescription>
            Configure your presentation export options.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Export Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {exporting ? (
          <div className="py-6 space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              Exporting presentation... {progress}%
            </p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4 pt-4">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Included Slides</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="title-slide" 
                            checked={config.includeTitleSlide}
                            onCheckedChange={(checked) => 
                              setConfig(prev => ({ ...prev, includeTitleSlide: checked === true }))
                            }
                          />
                          <Label htmlFor="title-slide">Title Slide</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="completion-slide" 
                            checked={config.includeCompletionSlide}
                            onCheckedChange={(checked) => 
                              setConfig(prev => ({ ...prev, includeCompletionSlide: checked === true }))
                            }
                          />
                          <Label htmlFor="completion-slide">Completion Rate Slide</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="trends-slide" 
                            checked={config.includeTrendsSlide}
                            onCheckedChange={(checked) => 
                              setConfig(prev => ({ ...prev, includeTrendsSlide: checked === true }))
                            }
                          />
                          <Label htmlFor="trends-slide">Response Trends Slide</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="question-slides" 
                            checked={config.includeQuestionSlides}
                            onCheckedChange={(checked) => 
                              setConfig(prev => ({ ...prev, includeQuestionSlides: checked === true }))
                            }
                          />
                          <Label htmlFor="question-slides">Question Slides</Label>
                        </div>
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Content Filters</h4>
                      <Alert>
                        <AlertDescription>
                          Text and comment questions are already excluded by default.
                        </AlertDescription>
                      </Alert>
                    </div>
                    
                    <Separator />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Presentation Metadata</h4>
                      {/* Author, Company, etc. could be added here */}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="comparisons" className="space-y-4 pt-4">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Comparison Dimensions</h4>
                      <p className="text-sm text-muted-foreground">
                        Select which dimensions to include in comparison slides.
                      </p>
                      
                      <div className="grid grid-cols-1 gap-2 mt-2">
                        {DIMENSION_OPTIONS.map(dimension => (
                          <div key={dimension.id} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`dimension-${dimension.id}`} 
                              checked={config.dimensions.includes(dimension.id)}
                              onCheckedChange={() => toggleDimension(dimension.id)}
                            />
                            <Label htmlFor={`dimension-${dimension.id}`}>{dimension.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
