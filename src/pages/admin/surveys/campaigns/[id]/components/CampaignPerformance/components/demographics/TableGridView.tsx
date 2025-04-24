
import React from 'react';
import { DemographicTable } from './DemographicTable';
import type { DemographicDistribution } from '../../types';

interface TableGridViewProps {
  demographicData: DemographicDistribution;
}

export function TableGridView({ demographicData }: TableGridViewProps) {
  const {
    departments,
    locations,
    employeeTypes,
    employmentTypes,
    genders,
    levels,
    ageGroups,
    tenureGroups
  } = demographicData;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {departments?.length > 0 && (
        <DemographicTable 
          title="Department"
          data={departments}
        />
      )}

      {locations?.length > 0 && (
        <DemographicTable 
          title="Location"
          data={locations}
        />
      )}

      {genders?.length > 0 && (
        <DemographicTable 
          title="Gender"
          data={genders}
        />
      )}

      {levels?.length > 0 && (
        <DemographicTable 
          title="Level"
          data={levels}
        />
      )}

      {employeeTypes?.length > 0 && (
        <DemographicTable 
          title="Employee Type"
          data={employeeTypes}
        />
      )}

      {employmentTypes?.length > 0 && (
        <DemographicTable 
          title="Employment Type"
          data={employmentTypes}
        />
      )}

      {ageGroups?.length > 0 && (
        <DemographicTable 
          title="Age Group"
          data={ageGroups}
          nameKey="ageGroup"
        />
      )}

      {tenureGroups?.length > 0 && (
        <DemographicTable 
          title="Tenure"
          data={tenureGroups}
          nameKey="tenureGroup"
        />
      )}
    </div>
  );
}
