/*
  Warnings:

  - The primary key for the `RolePermissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permissionid` on the `RolePermissions` table. All the data in the column will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RolePermissions" DROP CONSTRAINT "RolePermissions_permissionid_fkey";

-- AlterTable
ALTER TABLE "RolePermissions" DROP CONSTRAINT "RolePermissions_pkey",
DROP COLUMN "permissionid",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "RolePermissions_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Permission";
