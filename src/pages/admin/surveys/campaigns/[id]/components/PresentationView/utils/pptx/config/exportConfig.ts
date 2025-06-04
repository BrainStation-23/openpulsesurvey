
export interface ExportDimension {
  key: string;
  displayName: string;
  enabled: boolean;
}

export interface ExportConfig {
  dimensions: ExportDimension[];
  includeMainSlides: boolean;
  includeComparisonSlides: boolean;
}

export const DEFAULT_DIMENSIONS: ExportDimension[] = [
  { key: "supervisor", displayName: "Supervisor", enabled: true },
  { key: "sbu", displayName: "SBU", enabled: true },
  { key: "gender", displayName: "Gender", enabled: true },
  { key: "location", displayName: "Location", enabled: true },
  { key: "employment_type", displayName: "Employment Type", enabled: true },
  { key: "level", displayName: "Level", enabled: true },
  { key: "employee_type", displayName: "Employee Type", enabled: true },
  { key: "employee_role", displayName: "Employee Role", enabled: true },
  { key: "generation", displayName: "Generation", enabled: true }
];

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  dimensions: DEFAULT_DIMENSIONS,
  includeMainSlides: true,
  includeComparisonSlides: true
};
