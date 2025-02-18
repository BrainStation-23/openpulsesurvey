
import { useState, useEffect, useRef } from 'react';
import { Model } from "survey-core";
import * as themes from "survey-core/themes";
import { ThemeSettings } from './types';

export function useTheme(initialTheme: ThemeSettings) {
  const [currentTheme, setCurrentTheme] = useState<ThemeSettings>(initialTheme);

  const getThemeInstance = (themeSettings: ThemeSettings) => {
    const themeName = `${themeSettings.baseTheme}${themeSettings.isDark ? 'Dark' : 'Light'}${themeSettings.isPanelless ? 'Panelless' : ''}`;
    console.log("Getting theme instance for:", themeName);
    return (themes as any)[themeName];
  };

  return {
    currentTheme,
    setCurrentTheme,
    getThemeInstance,
  };
}
