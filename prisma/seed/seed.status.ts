// seed/seed-status.ts
import { PrismaClient } from '@prisma/client';

async function seedStatus(prisma: PrismaClient) {
  const statuses = [
    { status: 'Open' },
    { status: 'In Progress' },
    { status: 'Closed' },
  ];

  await prisma.status.createMany({
    data: statuses,
    skipDuplicates: true,
  });

  console.log('Seed des statuts terminé.');
}

export { seedStatus };
