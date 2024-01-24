-- CreateTable
CREATE TABLE "shippingaddresses" (
    "id" SERIAL NOT NULL,
    "addressLineOne" TEXT NOT NULL,
    "addressLineTwo" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "zipcode" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "shippingaddresses_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "shippingaddresses" ADD CONSTRAINT "shippingaddresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
