CREATE TABLE "player" (
  "id" uuid PRIMARY KEY,
  "username" text NOT NULL UNIQUE,
  "time_created" TIMESTAMPTZ DEFAULT now() NOT NULL
);