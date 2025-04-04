
import React from 'react';
import { RatingQuestion } from '@/types/survey-builder';
import { Star, Smile, Frown, MehIcon } from 'lucide-react';

interface RatingPreviewProps {
  question: RatingQuestion;
  value: number | undefined;
  onChange: (value: number) => void;
}

export const RatingPreview: React.FC<RatingPreviewProps> = ({
  question,
  value,
  onChange
}) => {
  const min = question.rateMin || 1;
  const max = question.rateMax || 5;
  const step = question.rateStep || 1;
  const type = question.rateType || 'stars';
  
  const ratings = [];
  for (let i = min; i <= max; i += step) {
    ratings.push(i);
  }
  
  const renderIcon = (rating: number, index: number) => {
    const isSelected = value === rating;
    const iconProps = {
      className: `${isSelected ? 'text-primary' : 'text-gray-300'} h-6 w-6 cursor-pointer`,
      onClick: () => onChange(rating)
    };
    
    switch (type) {
      case 'stars':
        return <Star {...iconProps} key={index} fill={isSelected ? 'currentColor' : 'none'} />;
      case 'smileys':
        return rating > (max + min) / 2 ? (
          <Smile {...iconProps} key={index} fill={isSelected ? 'currentColor' : 'none'} />
        ) : rating === (max + min) / 2 ? (
          <MehIcon {...iconProps} key={index} fill={isSelected ? 'currentColor' : 'none'} />
        ) : (
          <Frown {...iconProps} key={index} fill={isSelected ? 'currentColor' : 'none'} />
        );
      case 'numbers':
        return (
          <div 
            key={index}
            className={`${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'} h-8 w-8 rounded-full flex items-center justify-center cursor-pointer`}
            onClick={() => onChange(rating)}
          >
            {rating}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="flex items-center justify-center space-x-3 py-2">
      {ratings.map((rating, index) => renderIcon(rating, index))}
    </div>
  );
};
