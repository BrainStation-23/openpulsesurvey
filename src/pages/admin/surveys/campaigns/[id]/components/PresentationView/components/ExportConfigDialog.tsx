
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader } from "lucide-react";
import { ExportConfig, ExportDimension, ThemeConfig, DEFAULT_EXPORT_CONFIG } from "../utils/pptx/config/exportConfig";

interface ExportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (config: ExportConfig) => Promise<void>;
  isExporting: boolean;
}

const FONT_OPTIONS = [
  { value: "Arial", label: "Arial" },
  { value: "Calibri", label: "Calibri" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Verdana", label: "Verdana" }
];

const COLOR_PRESETS = [
  {
    name: "Default Purple",
    primary: "#9b87f5",
    secondary: "#7E69AB",
    tertiary: "#6E59A5"
  },
  {
    name: "Corporate Blue",
    primary: "#0EA5E9",
    secondary: "#0284C7",
    tertiary: "#0369A1"
  },
  {
    name: "Professional Green",
    primary: "#22C55E",
    secondary: "#16A34A",
    tertiary: "#15803D"
  },
  {
    name: "Modern Orange",
    primary: "#F97316",
    secondary: "#EA580C",
    tertiary: "#C2410C"
  }
];

export function ExportConfigDialog({ open, onOpenChange, onExport, isExporting }: ExportConfigDialogProps) {
  const [config, setConfig] = useState<ExportConfig>(DEFAULT_EXPORT_CONFIG);

  const handleDimensionToggle = (dimensionKey: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(dim =>
        dim.key === dimensionKey ? { ...dim, enabled: checked } : dim
      )
    }));
  };

  const handleThemeChange = (updates: Partial<ThemeConfig>) => {
    setConfig(prev => ({
      ...prev,
      theme: { ...prev.theme, ...updates }
    }));
  };

  const handleColorPresetSelect = (preset: typeof COLOR_PRESETS[0]) => {
    handleThemeChange({
      primary: preset.primary,
      secondary: preset.secondary,
      tertiary: preset.tertiary
    });
  };

  const handleExport = async () => {
    await onExport(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Configuration</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="dimensions" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <TabsContent value="dimensions" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Select Dimensions to Include</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose which demographic dimensions to include in comparison slides
              </p>
              <div className="grid grid-cols-2 gap-3">
                {config.dimensions.map((dimension) => (
                  <div key={dimension.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={dimension.key}
                      checked={dimension.enabled}
                      onCheckedChange={(checked) => 
                        handleDimensionToggle(dimension.key, checked as boolean)
                      }
                    />
                    <Label htmlFor={dimension.key} className="text-sm">
                      {dimension.displayName}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Theme Customization</h3>
              
              <div className="space-y-6">
                {/* Color Presets */}
                <div>
                  <Label className="text-sm font-medium">Color Presets</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {COLOR_PRESETS.map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        className="justify-start h-auto p-3"
                        onClick={() => handleColorPresetSelect(preset)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex space-x-1">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.secondary }}
                            />
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: preset.tertiary }}
                            />
                          </div>
                          <span className="text-sm">{preset.name}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="primary-color" className="text-sm">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={config.theme.primary}
                      onChange={(e) => handleThemeChange({ primary: e.target.value })}
                      className="h-10 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secondary-color" className="text-sm">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={config.theme.secondary}
                      onChange={(e) => handleThemeChange({ secondary: e.target.value })}
                      className="h-10 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tertiary-color" className="text-sm">Accent Color</Label>
                    <Input
                      id="tertiary-color"
                      type="color"
                      value={config.theme.tertiary}
                      onChange={(e) => handleThemeChange({ tertiary: e.target.value })}
                      className="h-10 mt-1"
                    />
                  </div>
                </div>

                {/* Font Selection */}
                <div>
                  <Label className="text-sm font-medium">Font Family</Label>
                  <Select
                    value={config.theme.fontFamily}
                    onValueChange={(value) => handleThemeChange({ fontFamily: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">Export Options</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-main"
                    checked={config.includeMainSlides}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, includeMainSlides: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include-main" className="text-sm">
                    Include main question slides
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-comparison"
                    checked={config.includeComparisonSlides}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, includeComparisonSlides: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include-comparison" className="text-sm">
                    Include demographic comparison slides
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-completion"
                    checked={config.includeCompletionSlide}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({ ...prev, includeCompletionSlide: checked as boolean }))
                    }
                  />
                  <Label htmlFor="include-completion" className="text-sm">
                    Include response completion slide
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export PPTX
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
