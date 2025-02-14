
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
  ContrastLight,
  PlainLight,
  SharpLight,
  SolidLight,
  LayeredLight,
  BorderlessLight,
  DoubleBorderLight,
  // Dark themes without panelless
  DefaultDark,
  ContrastDark,
  PlainDark,
  SharpDark,
  SolidDark,
  LayeredDark,
  BorderlessDark,
  DoubleBorderDark,
  // Light themes with panelless
  DefaultLightPanelless,
  ContrastLightPanelless,
  PlainLightPanelless,
  SharpLightPanelless,
  SolidLightPanelless,
  LayeredLightPanelless,
  BorderlessLightPanelless,
  DoubleBorderLightPanelless,
  // Dark themes with panelless
  DefaultDarkPanelless,
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
  const [currentThemeName, setCurrentThemeName] = useState<string>('DefaultDarkPanelless');

  useEffect(() => {
    const newThemeName = `${baseTheme}${isDark ? 'Dark' : 'Light'}${isPanelless ? 'Panelless' : ''}`;
    
    // Only apply theme if it's different from current
    if (newThemeName !== currentThemeName) {
      const theme = (themeMap as any)[newThemeName];
      if (theme) {
        console.log("Applying new theme:", newThemeName);
        onThemeChange(theme);
        setCurrentThemeName(newThemeName);
      } else {
        console.warn(`Theme ${newThemeName} not found`);
      }
    }
  }, [baseTheme, isDark, isPanelless, currentThemeName]); // Remove onThemeChange from deps

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
