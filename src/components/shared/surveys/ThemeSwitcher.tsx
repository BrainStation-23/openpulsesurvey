
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
  LayeredLight,
  LayeredDark,
  BorderlessLight,
  BorderlessDark,
  ContrastLight,
  ContrastDark,
  PlainLight,
  PlainDark,
  DoubleBorderLight,
  DoubleBorderDark,
  SharpLight,
  SharpDark,
  SolidLight,
  SolidDark,
  LayeredLightPanelless,
  LayeredDarkPanelless,
  BorderlessLightPanelless,
  BorderlessDarkPanelless,
  ContrastLightPanelless,
  ContrastDarkPanelless,
  PlainLightPanelless,
  PlainDarkPanelless,
  DoubleBorderLightPanelless,
  DoubleBorderDarkPanelless,
  SharpLightPanelless,
  SharpDarkPanelless,
  SolidLightPanelless,
  SolidDarkPanelless,
} from "survey-core/themes";

const BASE_THEMES = [
  "Layered",
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
  defaultBaseTheme?: string;
  defaultIsDark?: boolean;
  defaultIsPanelless?: boolean;
}

const themeMap = {
  // Light themes without panelless
  LayeredLight,
  ContrastLight,
  PlainLight,
  SharpLight,
  SolidLight,
  BorderlessLight,
  DoubleBorderLight,
  // Dark themes without panelless
  LayeredDark,
  ContrastDark,
  PlainDark,
  SharpDark,
  SolidDark,
  BorderlessDark,
  DoubleBorderDark,
  // Light themes with panelless
  LayeredLightPanelless,
  ContrastLightPanelless,
  PlainLightPanelless,
  SharpLightPanelless,
  SolidLightPanelless,
  BorderlessLightPanelless,
  DoubleBorderLightPanelless,
  // Dark themes with panelless
  LayeredDarkPanelless,
  ContrastDarkPanelless,
  PlainDarkPanelless,
  SharpDarkPanelless,
  SolidDarkPanelless,
  BorderlessDarkPanelless,
  DoubleBorderDarkPanelless,
};

export function ThemeSwitcher({ 
  onThemeChange, 
  defaultBaseTheme = 'Layered',
  defaultIsDark = true,
  defaultIsPanelless = true 
}: ThemeSwitcherProps) {
  // Ensure the base theme is capitalized to match our theme keys
  const capitalizedBaseTheme = defaultBaseTheme.charAt(0).toUpperCase() + defaultBaseTheme.slice(1);
  
  const [baseTheme, setBaseTheme] = useState<BaseTheme>(capitalizedBaseTheme as BaseTheme);
  const [isDark, setIsDark] = useState(defaultIsDark);
  const [isPanelless, setIsPanelless] = useState(defaultIsPanelless);

  // Initialize theme name based on current settings
  const getThemeName = (base: string, dark: boolean, panelless: boolean) => 
    `${base}${dark ? 'Dark' : 'Light'}${panelless ? 'Panelless' : ''}`;

  const [currentThemeName, setCurrentThemeName] = useState<string>(
    getThemeName(capitalizedBaseTheme, defaultIsDark, defaultIsPanelless)
  );

  // Apply theme and notify parent of changes
  const applyTheme = (themeName: string, themeState: { baseTheme: string; isDark: boolean; isPanelless: boolean }) => {
    const theme = (themeMap as any)[themeName];
    if (theme) {
      console.log("Applying theme:", themeName, "with state:", themeState);
      onThemeChange({
        theme,
        themeSettings: themeState
      });
      setCurrentThemeName(themeName);
    } else {
      console.warn(`Theme ${themeName} not found`);
    }
  };

  // Effect to handle prop changes
  useEffect(() => {
    const newThemeName = getThemeName(capitalizedBaseTheme, defaultIsDark, defaultIsPanelless);
    if (newThemeName !== currentThemeName) {
      console.log("Props changed, applying theme:", newThemeName);
      setBaseTheme(capitalizedBaseTheme as BaseTheme);
      setIsDark(defaultIsDark);
      setIsPanelless(defaultIsPanelless);
      applyTheme(newThemeName, {
        baseTheme: capitalizedBaseTheme,
        isDark: defaultIsDark,
        isPanelless: defaultIsPanelless
      });
    }
  }, [defaultBaseTheme, defaultIsDark, defaultIsPanelless]);

  // Handle theme changes from user interactions
  useEffect(() => {
    const newThemeName = getThemeName(baseTheme, isDark, isPanelless);
    if (newThemeName !== currentThemeName) {
      applyTheme(newThemeName, {
        baseTheme,
        isDark,
        isPanelless
      });
    }
  }, [baseTheme, isDark, isPanelless]);

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
