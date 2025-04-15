
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  PPTXExportConfig, 
  DEFAULT_EXPORT_CONFIG, 
  COMPARISON_DIMENSIONS,
  THEME_OPTIONS,
  ComparisonDimension
} from "../types/exportConfig";
import { CampaignData } from "../types";

interface ExportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (config: PPTXExportConfig) => void;
  campaign: CampaignData;
}

export function ExportConfigDialog({ 
  open, 
  onOpenChange, 
  onExport,
  campaign 
}: ExportConfigDialogProps) {
  const [config, setConfig] = useState<PPTXExportConfig>({ ...DEFAULT_EXPORT_CONFIG });
  
  // Get all questions from the campaign
  const allQuestions = (campaign?.survey?.json_data?.pages || [])
    .flatMap(page => page.elements || [])
    .filter(element => element.type !== undefined);
  
  const handleExport = () => {
    onExport(config);
    onOpenChange(false);
  };

  const toggleSlide = (slideKey: keyof PPTXExportConfig["slides"]) => {
    setConfig(prev => ({
      ...prev,
      slides: {
        ...prev.slides,
        [slideKey]: !prev.slides[slideKey as keyof typeof prev.slides]
      }
    }));
  };

  const toggleComparison = (dimension: ComparisonDimension) => {
    setConfig(prev => {
      const dimensions = prev.comparisons.dimensions.includes(dimension)
        ? prev.comparisons.dimensions.filter(d => d !== dimension)
        : [...prev.comparisons.dimensions, dimension];
        
      return {
        ...prev,
        comparisons: {
          ...prev.comparisons,
          dimensions
        }
      };
    });
  };

  const setTheme = (theme: PPTXExportConfig["theme"]) => {
    setConfig(prev => ({
      ...prev,
      theme
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure Presentation Export</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="content">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="content">Content Selection</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Slides to Include</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="title-slide" 
                    checked={config.slides.includeTitleSlide}
                    onCheckedChange={() => toggleSlide('includeTitleSlide')}
                  />
                  <Label htmlFor="title-slide">Title Slide</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="completion-slide" 
                    checked={config.slides.includeCompletionSlide}
                    onCheckedChange={() => toggleSlide('includeCompletionSlide')}
                  />
                  <Label htmlFor="completion-slide">Completion Statistics</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="trend-slide" 
                    checked={config.slides.includeTrendSlide}
                    onCheckedChange={() => toggleSlide('includeTrendSlide')}
                  />
                  <Label htmlFor="trend-slide">Response Trends</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="question-slides" 
                    checked={config.slides.includeQuestionSlides}
                    onCheckedChange={() => toggleSlide('includeQuestionSlides')}
                  />
                  <Label htmlFor="question-slides">Question Slides</Label>
                </div>
              </div>
            </div>

            {config.slides.includeQuestionSlides && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Question Options</h3>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="exclude-text"
                      checked={config.questions.excludeTextQuestions}
                      onCheckedChange={(checked) => setConfig(prev => ({
                        ...prev,
                        questions: {
                          ...prev.questions,
                          excludeTextQuestions: checked
                        }
                      }))}
                    />
                    <Label htmlFor="exclude-text">Exclude Text Questions</Label>
                  </div>
                </div>
              </div>
            )}

            {config.slides.includeQuestionSlides && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Comparison Dimensions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {COMPARISON_DIMENSIONS.map((dimension) => (
                    <div key={dimension} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`dimension-${dimension}`}
                        checked={config.comparisons.dimensions.includes(dimension)}
                        onCheckedChange={() => toggleComparison(dimension)}
                      />
                      <Label htmlFor={`dimension-${dimension}`} className="capitalize">
                        {dimension.replace(/_/g, ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theme</h3>
              <Select 
                value={config.theme} 
                onValueChange={(value) => setTheme(value as PPTXExportConfig["theme"])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  {THEME_OPTIONS.map(theme => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
          <TabsContent value="branding" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Logo</h3>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-logo"
                    checked={config.branding.includeLogo}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        includeLogo: checked
                      }
                    }))}
                  />
                  <Label htmlFor="include-logo">Include Logo</Label>
                </div>
              </div>
              
              {config.branding.includeLogo && (
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo URL</Label>
                  <Input 
                    id="logo-url" 
                    type="text" 
                    placeholder="https://example.com/logo.png"
                    value={config.branding.logoUrl || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        logoUrl: e.target.value
                      }
                    }))}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Footer</h3>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="include-footer"
                    checked={config.branding.includeFooter}
                    onCheckedChange={(checked) => setConfig(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        includeFooter: checked
                      }
                    }))}
                  />
                  <Label htmlFor="include-footer">Include Footer</Label>
                </div>
              </div>
              
              {config.branding.includeFooter && (
                <div className="space-y-2">
                  <Label htmlFor="footer-text">Footer Text</Label>
                  <Input 
                    id="footer-text" 
                    type="text" 
                    placeholder="Confidential - Internal Use Only"
                    value={config.branding.footerText || ''}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      branding: {
                        ...prev.branding,
                        footerText: e.target.value
                      }
                    }))}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export Presentation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
