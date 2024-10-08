import { PrismaClient } from '@prisma/client';
import { seedUser } from './seed/seed.user';
import { seedAddress } from './seed/seed-address';
import { seedStructure } from './seed/seed-structure';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  try {
    const existingAddressesCount = await prisma.address.count();
    const existingStructuresCount = await prisma.structure.count();
    const existingUsersCount = await prisma.user.count();
    if (existingAddressesCount >= 4000) {
      console.log(
        "La base de données contient déjà plus de 4000 adresses. Le seed n'est pas établi pour les adresses.",
      );
    } else {
      const addressesToInsert = await seedAddress(prisma);
      await prisma.address.createMany({
        data: addressesToInsert,
        skipDuplicates: true,
      });
      console.log('Seed des adresses terminé.');
    }

    if (existingStructuresCount >= 1000) {
      console.log(
        "La base de données contient déjà plus de 1000 structures. Le seed n'est pas établi pour les structures.",
      );
    } else {
      await prisma.structure.createMany({
        data: await seedStructure(prisma),
        skipDuplicates: true,
      });
      console.log('Seed des structures terminé.');
    }

    if (existingUsersCount >= 4000) {
      console.log(
        "La base de données contient déjà 2000 utilisateurs ou plus. Le seed n'est pas nécessaire pour les utilisateurs.",
      );
    } else {
      await seedUser(prisma);
      console.log('Seed des utilisateurs terminé.');
    }

    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    // Fermez Prisma Client à la fin
    await prisma.$disconnect();
  }
}

// Exécutez la fonction main
// main();
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
