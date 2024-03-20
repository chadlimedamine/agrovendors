/*
  Warnings:

  - A unique constraint covering the columns `[phoneNumber]` on the table `Phone` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Phone_phoneNumber_key" ON "Phone"("phoneNumber");
