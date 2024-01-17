/*
  Warnings:

  - You are about to drop the column `Amount` on the `orderitems` table. All the data in the column will be lost.
  - You are about to drop the column `TotalAmount` on the `orderitems` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orderitems" DROP COLUMN "Amount",
DROP COLUMN "TotalAmount";
