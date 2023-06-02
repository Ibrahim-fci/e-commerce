/*
  Warnings:

  - You are about to drop the `User_Order_Product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User_Order_Product" DROP CONSTRAINT "User_Order_Product_orderId_fkey";

-- DropForeignKey
ALTER TABLE "User_Order_Product" DROP CONSTRAINT "User_Order_Product_userId_fkey";

-- DropTable
DROP TABLE "User_Order_Product";

-- CreateTable
CREATE TABLE "Cart" (
    "orderId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "status" "OrderStatus" NOT NULL DEFAULT 'INPROGRESS',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("orderId","userId")
);

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
