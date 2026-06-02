/*
  Warnings:

  - You are about to drop the column `details` on the `GlobalStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `extraDetails` on the `GlobalStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `extraDetailsTooltip` on the `GlobalStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `GlobalStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `GlobalStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `details` on the `PlayerStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `extraDetails` on the `PlayerStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `extraDetailsTooltip` on the `PlayerStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PlayerStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `value` on the `PlayerStatistic` table. All the data in the column will be lost.
  - You are about to drop the column `valueAriaLabel` on the `PlayerStatistic` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "GlobalStatistic" DROP COLUMN "details",
DROP COLUMN "extraDetails",
DROP COLUMN "extraDetailsTooltip",
DROP COLUMN "name",
DROP COLUMN "value",
ADD COLUMN     "statistic" JSONB NOT NULL DEFAULT '{"type": "simple", "name": "", "value": ""}';

-- AlterTable
ALTER TABLE "PlayerStatistic" DROP COLUMN "details",
DROP COLUMN "extraDetails",
DROP COLUMN "extraDetailsTooltip",
DROP COLUMN "name",
DROP COLUMN "value",
DROP COLUMN "valueAriaLabel",
ADD COLUMN     "statistic" JSONB NOT NULL DEFAULT '{"type": "simple", "name": "", "value": ""}';
