// seed/seed-priority.ts
import { PrismaClient } from '@prisma/client';

async function seedPriority(prisma: PrismaClient) {
  const priorities = [
    { priority: 'Low' },
    { priority: 'Medium' },
    { priority: 'High' },
  ];

  await prisma.priority.createMany({
    data: priorities,
    skipDuplicates: true,
  });
}

export { seedPriority };
