"use client";

import type { QuestionDTO } from "@/lib/game/types";

type QuestionHistoryProps = {
  questions: QuestionDTO[];
};

function playerLabel(role: QuestionDTO["askingPlayer"]) {
  return role === "PLAYER_1" ? "Spieler 1" : "Spieler 2";
}

function answerLabel(answer: QuestionDTO["answer"]) {
  if (answer === "YES") return "Ja";
  if (answer === "NO") return "Nein";
  if (answer === "UNKNOWN") return "Nicht beantwortbar";
  return "Offen";
}

export function QuestionHistory({ questions }: QuestionHistoryProps) {
  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Fragen gestellt.</p>;
  }

  return (
    <ol className="flex max-h-72 flex-col gap-2 overflow-auto pr-1">
      {questions
        .slice()
        .reverse()
        .map((question) => (
          <li className="rounded-lg border border-border bg-muted/30 p-3 text-sm" key={question.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{playerLabel(question.askingPlayer)}</span>
              <span className="text-xs text-muted-foreground">{answerLabel(question.answer)}</span>
            </div>
            <p className="mt-2 leading-5">{question.text}</p>
          </li>
        ))}
    </ol>
  );
}
