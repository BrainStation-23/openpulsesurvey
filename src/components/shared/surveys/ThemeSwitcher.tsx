
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DefaultLight,
  DefaultDark,
  ModernLight,
  ModernDark,
  ContrastLight,
  ContrastDark,
  PlainLight,
  PlainDark,
  SharpLight,
  SharpDark,
  SolidLight,
  SolidDark,
  LayeredLight,
  LayeredDark,
  BorderlessLight,
  BorderlessDark,
  DoubleBorderLight,
  DoubleBorderDark,
  DefaultLightPanelless,
  DefaultDarkPanelless,
  ModernLightPanelless,
  ModernDarkPanelless,
  ContrastLightPanelless,
  ContrastDarkPanelless,
  PlainLightPanelless,
  PlainDarkPanelless,
  SharpLightPanelless,
  SharpDarkPanelless,
  SolidLightPanelless,
  SolidDarkPanelless,
  LayeredLightPanelless,
  LayeredDarkPanelless,
  BorderlessLightPanelless,
  BorderlessDarkPanelless,
  DoubleBorderLightPanelless,
  DoubleBorderDarkPanelless,
} from "survey-core/themes";

const BASE_THEMES = [
  "Default",
  "Modern",
  "Layered",
  "Flat",
  "Borderless",
  "Contrast",
  "Plain",
  "DoubleBorder",
  "Sharp",
  "Solid",
] as const;

type BaseTheme = typeof BASE_THEMES[number];

interface ThemeSwitcherProps {
  onThemeChange: (theme: any) => void;
}

const themeMap = {
  // Light themes without panelless
  DefaultLight,
  ModernLight,
  ContrastLight,
  PlainLight,
  SharpLight,
  SolidLight,
  LayeredLight,
  BorderlessLight,
  DoubleBorderLight,
  // Dark themes without panelless
  DefaultDark,
  ModernDark,
  ContrastDark,
  PlainDark,
  SharpDark,
  SolidDark,
  LayeredDark,
  BorderlessDark,
  DoubleBorderDark,
  // Light themes with panelless
  DefaultLightPanelless,
  ModernLightPanelless,
  ContrastLightPanelless,
  PlainLightPanelless,
  SharpLightPanelless,
  SolidLightPanelless,
  LayeredLightPanelless,
  BorderlessLightPanelless,
  DoubleBorderLightPanelless,
  // Dark themes with panelless
  DefaultDarkPanelless,
  ModernDarkPanelless,
  ContrastDarkPanelless,
  PlainDarkPanelless,
  SharpDarkPanelless,
  SolidDarkPanelless,
  LayeredDarkPanelless,
  BorderlessDarkPanelless,
  DoubleBorderDarkPanelless,
};

export function ThemeSwitcher({ onThemeChange }: ThemeSwitcherProps) {
  const [baseTheme, setBaseTheme] = useState<BaseTheme>("Default");
  const [isDark, setIsDark] = useState(true);
  const [isPanelless, setIsPanelless] = useState(true);

  useEffect(() => {
    // Construct theme name based on current settings
    const themeName = `${baseTheme}${isDark ? 'Dark' : 'Light'}${isPanelless ? 'Panelless' : ''}`;
    const theme = (themeMap as any)[themeName];
    
    if (theme) {
      console.log("Applying theme:", themeName);
      onThemeChange(theme);
    } else {
      console.warn(`Theme ${themeName} not found, falling back to DefaultDarkPanelless`);
      onThemeChange(DefaultDarkPanelless);
    }
  }, [baseTheme, isDark, isPanelless, onThemeChange]);

  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Select value={baseTheme} onValueChange={(value: BaseTheme) => setBaseTheme(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            {BASE_THEMES.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {theme}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch 
          id="dark-mode" 
          checked={isDark}
          onCheckedChange={setIsDark}
        />
        <Label htmlFor="dark-mode">Dark Mode</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch 
          id="panelless" 
          checked={isPanelless}
          onCheckedChange={setIsPanelless}
        />
        <Label htmlFor="panelless">Panelless</Label>
      </div>
    </div>
  );
}
