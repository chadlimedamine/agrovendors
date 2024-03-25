/*
  Warnings:

  - Added the required column `permission` to the `RolePermissions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('readUserById', 'readUsers', 'deleteUserByid');

-- AlterTable
ALTER TABLE "RolePermissions" ADD COLUMN     "permission" "Permission" NOT NULL;
