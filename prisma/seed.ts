import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as csv from 'csv-parser';
import { createReadStream } from 'node:fs';

const prisma = new PrismaClient()
async function main() {
    const passwordHash = await bcrypt.hash('blablablapassword', 10); 
  const mohamed = await prisma.user.upsert({
    where: {
        id: 1,
    },
    update: {},
    create: {
        fullName: 'Mohamed Amine Chadli',
        hash: passwordHash,
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
        hash: passwordHash,
        phoneNumbers: {
            createMany: {
                data: [
                    {phoneNumber: '0657558215'},
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
  const updateMohamed = await prisma.user.update({
    where: {
        id: 1,
    },
    data: {
        role: {
            connect: {
                id: 2,
            }
        }
    }
  });
  const updateBooba = await prisma.user.update({
    where: {
        id: 2,
    },
    data: {
        role: {
            connect: {
                id: 1,
            }
        }
    }
  });
  console.log({ mohamed, booba, userRole, adminRole, updateMohamed, updateBooba})

  // seed mock offers (same format as scraped marketplace posts)

  createReadStream('prisma/data/mock_agriculture_offers.csv', { encoding: 'utf-8' })
  .pipe(csv())
  .on('data', async (data) => {
    const phone = await prisma.phone.findUnique(
        {
            where: {
                phoneNumber: data.PhoneNumber
            }
        }
    );

    if (phone) {
        const offer = await prisma.offer.create(
            {
                data: {
                    description: data.PostText,
                    ownerId: phone.userId,
                    createdById: phone.userId 
                }
            }
        );
    } else {
        const user = await prisma.user.create(
            {
                data: {
                    fullName: data.UserFullName,
                    facebookProfileUrl: data.UserProfileUrl,
                    roleId: 1
                }
            }
        );

        const createdPhone = await prisma.phone.create(
            {
                data: {
                    phoneNumber: data.PhoneNumber,
                    userId: user.id
                }
            }
        );

        const offer = await prisma.offer.create(
            {
                data: {
                    description: data.PostText,
                    ownerId: user.id,
                    createdById: user.id,
                }
            }
        );
    }
  })
  .on('end', (data) => {
    console.log(data);
  });
  
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