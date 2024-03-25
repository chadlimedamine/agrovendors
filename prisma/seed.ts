import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const mohamed = await prisma.user.upsert({
    where: {
        id: 1,
    },
    update: {},
    create: {
        fullName: 'Mohamed Amine Chadli',
        phoneNumbers: {
            create: {
                phoneNumber: '0657558214',
            }
        }
    }
  });
  const booba = await prisma.user.upsert({
    where: {
        id: 2,
    },
    update: {},
    create: {
        fullName: 'Aboubakr Belgacem',
        phoneNumbers: {
            createMany: {
                data: [
                    {phoneNumber: '0676526179'},
                    {phoneNumber: '0775472740'}
                ],
            }
        }
    }
  });
  const userRole = await prisma.role.upsert({
    where: {
        id: 1,
    },
    update: {},
    create: {
        name: 'user',
        permissions: {
            createMany: {
                data: [],
            }
        }
    }
  });

  const adminRole = await prisma.role.upsert({
    where: {
        id: 2,
    },
    update: {},
    create: {
        name: 'admin',
        permissions: {
            createMany: {
                data: [
                    {permission: 'ReadUsers', assignedById: 1},
                    {permission: 'ReadUserById', assignedById: 1},
                    {permission: 'DeleteUserByid', assignedById: 1},
                ],
            }
        }
    },
  });
  console.log({ mohamed, booba, userRole, adminRole})
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })