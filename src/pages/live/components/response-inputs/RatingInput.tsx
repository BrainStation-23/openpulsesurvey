
import { Button } from "@/components/ui/button";

interface RatingInputProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  rateCount?: number;
}

export function RatingInput({ value, onChange, isDisabled, rateCount = 5 }: RatingInputProps) {
  // Create an array of numbers from 1 to rateCount
  const ratings = Array.from({ length: rateCount }, (_, i) => i + 1);
  
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {ratings.map((number) => (
        <Button
          key={number}
          onClick={() => onChange(number.toString())}
          variant={value === number.toString() ? 'default' : 'outline'}
          disabled={isDisabled}
          className="w-12 h-12"
        >
          {number}
        </Button>
      ))}
    </div>
  );
}
