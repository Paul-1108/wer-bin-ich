"use client";

import { AnswerButtons } from "@/components/ui/game/AnswersButtons";
import { QuestionHistory } from "@/components/ui/game/QuestionHistory";
import { QuestionInput } from "@/components/ui/game/QuestionInput";
import type { GameViewDTO, QuestionAnswer } from "@/lib/game/types";

type QuestionPanelProps = {
  game: GameViewDTO;
  disabled?: boolean;
  onAskQuestion: (question: string) => void;
  onAnswerQuestion: (answer: QuestionAnswer) => void;
};

function isOwnTurn(game: GameViewDTO) {
  return game.viewerRole !== "SPECTATOR" && game.currentTurn === game.viewerRole;
}

function canAnswer(game: GameViewDTO) {
  return (
    game.status === "PLAYING" &&
    game.viewerRole !== "SPECTATOR" &&
    !!game.openQuestion &&
    game.openQuestion.askingPlayer !== game.viewerRole
  );
}

export function QuestionPanel({ game, disabled = false, onAskQuestion, onAnswerQuestion }: QuestionPanelProps) {
  const mayAsk = game.status === "PLAYING" && isOwnTurn(game) && !game.openQuestion;
  const mayAnswer = canAnswer(game);

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div>
        <h2 className="text-sm font-semibold">Frage und Antwort</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Bei Ja bleibt der fragende Spieler dran, bei Nein oder nicht beantwortbar wechselt der Zug.
        </p>
      </div>

      {game.status === "SETUP" && (
        <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
          Das Spiel startet, sobald Spieler 1 und Spieler 2 belegt sind.
        </div>
      )}

      {game.openQuestion && (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">Aktuelle Frage</p>
          <p className="mt-1 text-sm font-medium leading-6">{game.openQuestion.text}</p>
        </div>
      )}

      {mayAsk && <QuestionInput disabled={disabled} onSubmit={onAskQuestion} />}
      {mayAnswer && <AnswerButtons disabled={disabled} onAnswer={onAnswerQuestion} />}

      {!mayAsk && !mayAnswer && game.status === "PLAYING" && (
        <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
          {game.viewerRole === "SPECTATOR"
            ? "Du schaust zu."
            : game.openQuestion
              ? "Warte auf die Antwort."
              : "Warte auf deinen Zug."}
        </div>
      )}

      <div className="border-t border-border pt-4">
        <h3 className="mb-3 text-sm font-semibold">Verlauf</h3>
        <QuestionHistory questions={game.questions} />
      </div>
    </section>
  );
}
