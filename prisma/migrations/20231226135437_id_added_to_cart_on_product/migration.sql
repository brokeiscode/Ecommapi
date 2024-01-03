/*
  Warnings:

  - The primary key for the `CartOnProduct` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[productId,cartId]` on the table `CartOnProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CartOnProduct" DROP CONSTRAINT "CartOnProduct_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "CartOnProduct_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "CartOnProduct_productId_cartId_key" ON "CartOnProduct"("productId", "cartId");
