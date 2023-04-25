/*
  Warnings:

  - You are about to drop the column `userId` on the `Advertisement` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_userId_fkey";

-- AlterTable
ALTER TABLE "Advertisement" DROP COLUMN "userId";
