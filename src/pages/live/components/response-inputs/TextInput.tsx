
import { Input } from "@/components/ui/input";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}

export function TextInput({ value, onChange, isDisabled }: TextInputProps) {
  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Your answer"
      disabled={isDisabled}
    />
  );
}
