
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface Choice {
  text: string;
  value: string;
}

interface MultipleChoiceInputProps {
  choices: Choice[];
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}

export function MultipleChoiceInput({ choices, value, onChange, isDisabled }: MultipleChoiceInputProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="space-y-2"
      disabled={isDisabled}
    >
      {choices.map((choice) => (
        <div key={choice.value} className="flex items-center space-x-2">
          <RadioGroupItem value={choice.value} id={choice.value} />
          <label
            htmlFor={choice.value}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
              value === choice.value && "text-primary"
            )}
          >
            {choice.text}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
