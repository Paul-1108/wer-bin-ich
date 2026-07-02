"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AskQuestionFormSchema, type AskQuestionFormInput } from "@/lib/game/schemas";

type QuestionInputProps = {
  disabled?: boolean;
  onSubmit: (question: string) => void;
};

export function QuestionInput({ disabled = false, onSubmit }: QuestionInputProps) {
  const form = useForm<AskQuestionFormInput>({
    resolver: zodResolver(AskQuestionFormSchema),
    defaultValues: {
      text: "",
    },
  });

  const error = form.formState.errors.text?.message;

  function handleSubmit(data: AskQuestionFormInput) {
    onSubmit(data.text);
    form.reset();
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex gap-2">
        <Input
          aria-invalid={!!error}
          disabled={disabled}
          placeholder="Ja/Nein-Frage eingeben..."
          {...form.register("text")}
        />
        <Button disabled={disabled} type="submit">
          Fragen
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
