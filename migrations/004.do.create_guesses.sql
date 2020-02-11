CREATE TABLE "guesses" (
  "id" SERIAL PRIMARY KEY,
  "guess" TEXT NOT NULL,
  "player_id" uuid REFERENCES "player"(id),
  "game_id" uuid REFERENCES "game"(id) ON DELETE CASCADE NOT NULL
);