CREATE TABLE "game_players" (
  "id" SERIAL PRIMARY KEY,
  "player_id" uuid REFERENCES "player"(id) ON DELETE CASCADE NOT NULL,
  "game_id" uuid REFERENCES "game"(id) ON DELETE CASCADE NOT NULL,
  "score" INTEGER
);