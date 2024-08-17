import { PrismaClient } from '@prisma/client';
import { seedUser } from './seed/seed.user';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  try {
    const existingUsersCount = await prisma.user.count();

    if (existingUsersCount >= 2000) {
      console.log(
        "La base de données contient déjà 20 utilisateurs ou plus. Le seed n'est pas nécessaire pour les utilisateurs.",
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
