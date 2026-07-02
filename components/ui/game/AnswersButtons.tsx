"use client";

import { Button } from "@/components/ui/button";
import type { QuestionAnswer } from "@/lib/game/types";

type AnswerButtonsProps = {
  disabled?: boolean;
  onAnswer: (answer: QuestionAnswer) => void;
};

export function AnswerButtons({ disabled = false, onAnswer }: AnswerButtonsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button disabled={disabled} onClick={() => onAnswer("YES")} type="button">
        Ja
      </Button>
      <Button disabled={disabled} onClick={() => onAnswer("NO")} type="button" variant="outline">
        Nein
      </Button>
      <Button disabled={disabled} onClick={() => onAnswer("UNKNOWN")} type="button" variant="secondary">
        Nicht beantwortbar
      </Button>
    </div>
  );
}
