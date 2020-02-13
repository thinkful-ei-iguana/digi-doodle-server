CREATE TABLE "answers" (
  "id" SERIAL PRIMARY KEY,
  "prompt_value" TEXT REFERENCES "prompts"(prompt) ON DELETE CASCADE NOT NULL,
  "accepted" TEXT NOT NULL
)