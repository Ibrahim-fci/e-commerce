-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CLIENT', 'COMPANY', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CLIENT';
