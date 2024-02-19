/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `shippingaddresses` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "shippingaddresses" ALTER COLUMN "addressLineOne" SET DEFAULT 'fill in details',
ALTER COLUMN "city" SET DEFAULT 'fill in details',
ALTER COLUMN "state" SET DEFAULT 'fill in details',
ALTER COLUMN "country" SET DEFAULT 'fill in details',
ALTER COLUMN "zipcode" SET DEFAULT 'fill in details';

-- CreateIndex
CREATE UNIQUE INDEX "shippingaddresses_userId_key" ON "shippingaddresses"("userId");
