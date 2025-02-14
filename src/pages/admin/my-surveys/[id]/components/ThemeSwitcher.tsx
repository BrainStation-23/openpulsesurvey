
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

export function ThemeSwitcher({ onThemeChange }: ThemeSwitcherProps) {
  const [baseTheme, setBaseTheme] = useState<BaseTheme>("Default");
  const [isDark, setIsDark] = useState(true);
  const [isPanelless, setIsPanelless] = useState(true);

  useEffect(() => {
    const themeName = `${baseTheme}${isDark ? 'Dark' : 'Light'}${isPanelless ? 'Panelless' : ''}`;
    import(`survey-core/themes`).then((themes) => {
      if (themes[themeName]) {
        onThemeChange(themes[themeName]);
      }
    });
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
