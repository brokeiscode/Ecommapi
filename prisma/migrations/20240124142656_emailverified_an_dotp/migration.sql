-- AlterTable
ALTER TABLE "users" ADD COLUMN     "currentOTP" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false;
