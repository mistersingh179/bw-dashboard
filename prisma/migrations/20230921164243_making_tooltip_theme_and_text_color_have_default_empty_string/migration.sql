/*
  Warnings:

  - Made the column `metaContentToolTipTextColor` on table `Setting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `metaContentToolTipTheme` on table `Setting` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Setting" ALTER COLUMN "metaContentToolTipTextColor" SET NOT NULL,
ALTER COLUMN "metaContentToolTipTextColor" SET DEFAULT '',
ALTER COLUMN "metaContentToolTipTheme" SET NOT NULL,
ALTER COLUMN "metaContentToolTipTheme" SET DEFAULT '';
