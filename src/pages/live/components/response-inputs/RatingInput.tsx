
import { Button } from "@/components/ui/button";

interface RatingInputProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}

export function RatingInput({ value, onChange, isDisabled }: RatingInputProps) {
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {[1, 2, 3, 4, 5].map((number) => (
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
