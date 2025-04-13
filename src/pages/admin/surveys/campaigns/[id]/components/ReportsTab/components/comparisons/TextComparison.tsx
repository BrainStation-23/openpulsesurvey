import React from 'react';
import { ComparisonDataItem } from '../../types/rpc';
import { useComparisonData } from '../../hooks/useComparisonData';
import { ProcessedResponse } from '../../hooks/useResponseProcessing';

interface TextComparisonProps {
  // Accept either direct data or params to fetch data
  data?: ComparisonDataItem[];
  // For when component needs to fetch its own data
  responses?: ProcessedResponse[];
  questionName?: string;
  dimension?: string;
  // Optional layout customization
  layout?: 'default' | 'grid';
}

export const TextComparison: React.FC<TextComparisonProps> = ({
  data: providedData,
  responses,
  questionName,
  dimension,
  layout = 'default'
}) => {
  // If direct data is provided, use it
  // Otherwise, fetch data using the comparison hook
  const { data: fetchedData } = useComparisonData(
    responses && questionName && dimension 
      ? { 
          campaignId: responses[0]?.id.split('-')[0] || '', 
          questionName, 
          dimension: dimension as any 
        } 
      : null
  );

  const data = providedData || fetchedData || [];

  return (
    <div className={layout === 'grid' ? 'grid grid-cols-2 gap-6' : ''}>
      {data.map((dimension) => (
        <div key={dimension.dimension} className="mb-4">
          <h3 className="text-lg font-semibold">{dimension.dimension}</h3>
          <div>
            <p>Text Response Count: {dimension.text_response_count}</p>
          </div>
          {dimension.text_samples && dimension.text_samples.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mt-2">Text Samples:</h4>
              <ul className="space-y-2">
                {dimension.text_samples.map((sample, index) => (
                  <li key={index} className="list-disc ml-5">
                    {sample}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
