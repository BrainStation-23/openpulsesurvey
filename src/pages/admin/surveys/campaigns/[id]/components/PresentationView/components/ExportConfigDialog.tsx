
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CampaignData } from "../types";
import { DEFAULT_EXPORT_CONFIG, PPTXExportConfig, ComparisonDimension } from "../types/exportConfig";
import { COMPARISON_DIMENSIONS } from "../constants";

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
  campaign,
}: ExportConfigDialogProps) {
  const [config, setConfig] = useState<PPTXExportConfig>({ ...DEFAULT_EXPORT_CONFIG });
  const [activeTab, setActiveTab] = useState("content");

  const handleCheckboxChange = (
    section: keyof PPTXExportConfig,
    property: string,
    value: boolean
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [property]: value,
      },
    }));
  };

  const handleComparisonDimensionToggle = (dimension: ComparisonDimension) => {
    setConfig((prev) => {
      const dimensions = [...prev.comparisons.dimensions];
      
      if (dimensions.includes(dimension)) {
        return {
          ...prev,
          comparisons: {
            ...prev.comparisons,
            dimensions: dimensions.filter((d) => d !== dimension),
          },
        };
      } else {
        return {
          ...prev,
          comparisons: {
            ...prev.comparisons,
            dimensions: [...dimensions, dimension],
          },
        };
      }
    });
  };

  const handleThemeChange = (theme: string) => {
    setConfig((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        theme,
      },
    }));
  };

  const handleInputChange = (
    section: keyof PPTXExportConfig,
    property: string,
    value: string
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [property]: value,
      },
    }));
  };

  const handleExport = () => {
    onExport(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configure Presentation Export</DialogTitle>
          <DialogDescription>
            Customize what to include in your PowerPoint presentation.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="comparisons">Comparisons</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Slides to Include</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="titleSlide"
                    checked={config.slides.includeTitleSlide}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("slides", "includeTitleSlide", !!checked)
                    }
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="titleSlide">Title Slide</Label>
                    <p className="text-sm text-muted-foreground">
                      Includes the campaign title and basic information
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="completionSlide"
                    checked={config.slides.includeCompletionSlide}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("slides", "includeCompletionSlide", !!checked)
                    }
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="completionSlide">Completion Rate Slide</Label>
                    <p className="text-sm text-muted-foreground">
                      Shows survey completion statistics
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="questionSlides"
                    checked={config.slides.includeQuestionSlides}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("slides", "includeQuestionSlides", !!checked)
                    }
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="questionSlides">Question Slides</Label>
                    <p className="text-sm text-muted-foreground">
                      Individual slides for each question with visualizations
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Question Options</h3>
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="excludeTextQuestions"
                  checked={config.questions.excludeTextQuestions}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("questions", "excludeTextQuestions", !!checked)
                  }
                />
                <div className="space-y-1 leading-none">
                  <Label htmlFor="excludeTextQuestions">Exclude Text Questions</Label>
                  <p className="text-sm text-muted-foreground">
                    Skip open-ended text questions that don't have visualizations
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comparisons" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Comparison Dimensions</h3>
              <p className="text-sm text-muted-foreground">
                Select which dimensions to create comparison slides for
              </p>
              <div className="grid grid-cols-2 gap-4">
                {COMPARISON_DIMENSIONS.map((dimension) => (
                  <div key={dimension} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dimension-${dimension}`}
                      checked={config.comparisons.dimensions.includes(dimension)}
                      onCheckedChange={() => handleComparisonDimensionToggle(dimension)}
                    />
                    <Label htmlFor={`dimension-${dimension}`}>
                      {dimension.replace(/_/g, ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {["default", "corporate", "modern", "minimal", "vibrant"].map((theme) => (
                  <div
                    key={theme}
                    className={`border rounded-md p-4 cursor-pointer transition-all ${
                      config.branding.theme === theme
                        ? "border-primary bg-primary/10"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleThemeChange(theme)}
                  >
                    <div className="text-center capitalize">{theme}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Branding</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="includeLogo"
                    checked={config.branding.includeLogo}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("branding", "includeLogo", !!checked)
                    }
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="includeLogo">Include Logo</Label>
                    <p className="text-sm text-muted-foreground">
                      Add your company logo to slides
                    </p>
                  </div>
                </div>

                {config.branding.includeLogo && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      placeholder="https://example.com/logo.png"
                      value={config.branding.logoUrl || ""}
                      onChange={(e) =>
                        handleInputChange("branding", "logoUrl", e.target.value)
                      }
                    />
                  </div>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="includeFooter"
                    checked={config.branding.includeFooter}
                    onCheckedChange={(checked) =>
                      handleCheckboxChange("branding", "includeFooter", !!checked)
                    }
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="includeFooter">Include Footer</Label>
                    <p className="text-sm text-muted-foreground">
                      Add a custom footer to all slides
                    </p>
                  </div>
                </div>

                {config.branding.includeFooter && (
                  <div className="space-y-2 pl-6">
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Input
                      id="footerText"
                      placeholder="© 2025 Your Company Name"
                      value={config.branding.footerText || ""}
                      onChange={(e) =>
                        handleInputChange("branding", "footerText", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>Export Presentation</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
