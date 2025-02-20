
import * as themes from "survey-core/themes";

export function getThemeInstance(themeSettings: any) {
  const themeName = `${themeSettings.baseTheme}${themeSettings.isDark ? 'Dark' : 'Light'}${themeSettings.isPanelless ? 'Panelless' : ''}`;
  return (themes as any)[themeName];
}
