/*
  Warnings:

  - Added the required column `locationId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `regular` to the `Player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Match" ADD COLUMN     "locationId" INTEGER NOT NULL,
ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."Player" ADD COLUMN     "regular" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "public"."TeamPlayer" ADD COLUMN     "weight" REAL;

-- CreateTable
CREATE TABLE "public"."Location" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GlobalStatistic" (
    "id" SERIAL NOT NULL,
    "index" SMALLINT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "details" TEXT,
    "extraDetails" TEXT,
    "extraDetailsTooltip" TEXT,

    CONSTRAINT "GlobalStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PlayerStatistic" (
    "id" SERIAL NOT NULL,
    "index" SMALLINT NOT NULL,
    "playerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "details" TEXT,
    "extraDetails" TEXT,
    "extraDetailsTooltip" TEXT,

    CONSTRAINT "PlayerStatistic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Match" ADD CONSTRAINT "Match_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PlayerStatistic" ADD CONSTRAINT "PlayerStatistic_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
