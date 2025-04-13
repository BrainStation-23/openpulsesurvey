
import { BooleanInput } from "./response-inputs/BooleanInput";
import { RatingInput } from "./response-inputs/RatingInput";
import { MultipleChoiceInput } from "./response-inputs/MultipleChoiceInput";
import { TextInput } from "./response-inputs/TextInput";
import { ActiveQuestion } from "../types";

interface ResponseInputProps {
  question: ActiveQuestion;
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
}

export function ResponseInput({ question, value, onChange, isDisabled }: ResponseInputProps) {
  switch (question.question_data.type) {
    case 'boolean':
      return <BooleanInput value={value} onChange={onChange} isDisabled={isDisabled} />;
    case 'rating':
      return (
        <RatingInput 
          value={value} 
          onChange={onChange} 
          isDisabled={isDisabled}
          rateCount={question.question_data.rateMax || 5}
        />
      );
    case 'multiple_choice':
      if (!question.question_data.choices) return null;
      return (
        <MultipleChoiceInput
          choices={question.question_data.choices}
          value={value}
          onChange={onChange}
          isDisabled={isDisabled}
        />
      );
    case 'text':
    default:
      return <TextInput value={value} onChange={onChange} isDisabled={isDisabled} />;
  }
}
