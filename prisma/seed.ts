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
  console.log({ mohamed, booba })
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