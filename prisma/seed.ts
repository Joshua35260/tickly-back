import { PrismaClient } from '@prisma/client';
import { seedUser } from './seed/seed.user';
import { seedAddress } from './seed/seed-address';
import { seedStructure } from './seed/seed-structure';
import { seedTicket } from './seed/seed.ticket';
import { seedCategory } from './seed/seed.category';
import { seedPriority } from './seed/seed.priority';
import { seedStatus } from './seed/seed.status';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  try {
    const existingAddressesCount = await prisma.address.count();
    const existingStructuresCount = await prisma.structure.count();
    const existingUsersCount = await prisma.user.count();
    const existingCategoriesCount = await prisma.category.count();
    const existingPrioritiesCount = await prisma.priority.count();
    const existingStatusesCount = await prisma.status.count();
    const existingTicketsCount = await prisma.ticket.count();
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

    if (existingUsersCount >= 6000) {
      console.log(
        "La base de données contient déjà 2000 utilisateurs ou plus. Le seed n'est pas nécessaire pour les utilisateurs.",
      );
    } else {
      await seedUser(prisma);
      console.log('Seed des utilisateurs terminé.');
    }

    console.log('Seed completed successfully.');
    if (existingCategoriesCount === 0) {
      await seedCategory(prisma);
      console.log('Seed des catégories terminé.');
    } else {
      console.log(
        "Les catégories sont déjà peuplées, le seed n'est pas nécessaire.",
      );
    }

    // Seed des priorités
    if (existingPrioritiesCount === 0) {
      await seedPriority(prisma);
      console.log('Seed des priorités terminé.');
    } else {
      console.log(
        "Les priorités sont déjà peuplées, le seed n'est pas nécessaire.",
      );
    }

    // Seed des statuts
    if (existingStatusesCount === 0) {
      await seedStatus(prisma);
      console.log('Seed des statuts terminé.');
    } else {
      console.log(
        "Les statuts sont déjà peuplés, le seed n'est pas nécessaire.",
      );
    }
    if (existingTicketsCount >= 1000) {
      console.log(
        "La base de données contient déjà 1000 tickets ou plus. Le seed n'est pas nécessaire pour les tickets.",
      );
    } else {
      await seedTicket(prisma);
      console.log('Seed des tickets terminé.');
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
