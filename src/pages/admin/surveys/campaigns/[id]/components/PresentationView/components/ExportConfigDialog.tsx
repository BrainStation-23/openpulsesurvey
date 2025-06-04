
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ExportConfig, DEFAULT_EXPORT_CONFIG, BACKGROUND_THEMES } from "../utils/pptx/config/exportConfig";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (config: ExportConfig) => void;
}

export function ExportConfigDialog({ open, onOpenChange, onExport }: ExportConfigDialogProps) {
  const [config, setConfig] = useState<ExportConfig>(DEFAULT_EXPORT_CONFIG);

  const handleDimensionToggle = (dimensionKey: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      dimensions: prev.dimensions.map(dim => 
        dim.key === dimensionKey ? { ...dim, enabled } : dim
      )
    }));
  };

  const handleThemeChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value
      }
    }));
  };

  const handleBackgroundChange = (backgroundId: string) => {
    const background = BACKGROUND_THEMES.find(bg => bg.id === backgroundId);
    if (background) {
      setConfig(prev => ({
        ...prev,
        theme: {
          ...prev.theme,
          background
        }
      }));
    }
  };

  const handleTextColorChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        text: {
          ...prev.theme.text,
          [field]: value.startsWith('#') ? value : `#${value}`
        }
      }
    }));
  };

  const handleExport = () => {
    onExport(config);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Configuration</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Slide Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Slide Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="main-slides">Include Main Question Slides</Label>
                <Switch
                  id="main-slides"
                  checked={config.includeMainSlides}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeMainSlides: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="comparison-slides">Include Comparison Slides</Label>
                <Switch
                  id="comparison-slides"
                  checked={config.includeComparisonSlides}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeComparisonSlides: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="completion-slide">Include Response Distribution Slide</Label>
                <Switch
                  id="completion-slide"
                  checked={config.includeCompletionSlide}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeCompletionSlide: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Dimensions Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparison Dimensions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {config.dimensions.map((dimension) => (
                  <div key={dimension.key} className="flex items-center space-x-2">
                    <Switch
                      id={dimension.key}
                      checked={dimension.enabled}
                      onCheckedChange={(checked) => handleDimensionToggle(dimension.key, checked)}
                    />
                    <Label htmlFor={dimension.key} className="text-sm">
                      {dimension.displayName}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Theme Customization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Theme Customization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Background Theme */}
              <div className="space-y-2">
                <Label>Background Theme</Label>
                <Select 
                  value={config.theme.background.id} 
                  onValueChange={handleBackgroundChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BACKGROUND_THEMES.map((bg) => (
                      <SelectItem key={bg.id} value={bg.id}>
                        {bg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Family */}
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select 
                  value={config.theme.fontFamily} 
                  onValueChange={(value) => handleThemeChange('fontFamily', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Calibri">Calibri</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Color Customization */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input
                    type="color"
                    value={config.theme.primary}
                    onChange={(e) => handleThemeChange('primary', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <Input
                    type="color"
                    value={config.theme.secondary}
                    onChange={(e) => handleThemeChange('secondary', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Text</Label>
                  <Input
                    type="color"
                    value={config.theme.text.primary}
                    onChange={(e) => handleTextColorChange('primary', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Text</Label>
                  <Input
                    type="color"
                    value={config.theme.text.secondary}
                    onChange={(e) => handleTextColorChange('secondary', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            Export Presentation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
