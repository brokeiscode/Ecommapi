-- AlterTable
ALTER TABLE "cart" ALTER COLUMN "itemnumber" DROP NOT NULL,
ALTER COLUMN "subtotal" DROP NOT NULL;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "itembuy" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "saveditems" ALTER COLUMN "itemnumber" DROP NOT NULL;
