// Ephemeral in-memory store for the current assessment session.
// We intentionally do NOT persist health form values to localStorage.
import type { PredictResponse } from "@/types/api";

type Answers = Record<string, string | number | null>;

let answers: Answers | null = null;
let result: PredictResponse | null = null;

export const sessionStore = {
  setAnswers(a: Answers) {
    answers = a;
  },
  getAnswers(): Answers | null {
    return answers;
  },
  setResult(r: PredictResponse) {
    result = r;
  },
  getResult(): PredictResponse | null {
    return result;
  },
  clear() {
    answers = null;
    result = null;
  },
};
