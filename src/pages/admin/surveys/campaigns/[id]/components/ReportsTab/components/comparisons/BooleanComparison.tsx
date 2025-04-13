import React from 'react';
import { ComparisonDataItem } from '../../types/rpc';

interface BooleanComparisonProps {
  data: ComparisonDataItem[];
}

export const BooleanComparison: React.FC<BooleanComparisonProps> = ({ data }) => {
  return (
    <div>
      {data.map((dimension) => (
        <div key={dimension.dimension} className="mb-4">
          <h3 className="text-lg font-semibold">{dimension.dimension}</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p>Yes: {dimension.yes_count}</p>
            </div>
            <div>
              <p>No: {dimension.no_count}</p>
            </div>
            <div>
              <p>
                Avg Rating:{' '}
                {dimension.avg_rating !== null && typeof dimension.avg_rating === 'number'
                  ? dimension.avg_rating.toFixed(1)
                  : 'N/A'}
              </p>
            </div>
          </div>
          <div>
            <p>Text Response Count: {dimension.text_response_count}</p>
          </div>
          {dimension.text_samples && dimension.text_samples.length > 0 && (
            <div>
              <h4 className="text-md font-semibold mt-2">Text Samples:</h4>
              <ul>
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
