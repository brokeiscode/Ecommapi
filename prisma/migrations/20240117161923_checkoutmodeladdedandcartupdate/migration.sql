/*
  Warnings:

  - You are about to drop the column `deliveryfee` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `discount` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `itemtotal` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `taxcharge` on the `carts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "carts" DROP COLUMN "deliveryfee",
DROP COLUMN "discount",
DROP COLUMN "itemtotal",
DROP COLUMN "taxcharge";

-- CreateTable
CREATE TABLE "Checkout" (
    "id" SERIAL NOT NULL,
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "taxcharge" INTEGER NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "deliveryfee" INTEGER NOT NULL DEFAULT 0,
    "totalamount" INTEGER NOT NULL DEFAULT 0,
    "itemtotal" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Checkout_pkey" PRIMARY KEY ("id")
);
