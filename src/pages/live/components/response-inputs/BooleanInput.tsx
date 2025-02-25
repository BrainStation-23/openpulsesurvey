
import { Button } from "@/components/ui/button";

interface BooleanInputProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}

export function BooleanInput({ value, onChange, isDisabled }: BooleanInputProps) {
  return (
    <div className="flex gap-4 justify-center">
      <Button
        onClick={() => onChange('true')}
        variant={value === 'true' ? 'default' : 'outline'}
        disabled={isDisabled}
      >
        Yes
      </Button>
      <Button
        onClick={() => onChange('false')}
        variant={value === 'false' ? 'default' : 'outline'}
        disabled={isDisabled}
      >
        No
      </Button>
    </div>
  );
}
