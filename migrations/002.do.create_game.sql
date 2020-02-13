CREATE TABLE "game" (
  "id" uuid PRIMARY KEY NOT NULL,
  "canvas" VARCHAR(2083) NOT NULL,
  "current_drawer" uuid REFERENCES "player"(id) ON DELETE CASCADE NOT NULL,
  "current_answer" TEXT,
  "time_limit" INTEGER DEFAULT 6000
);