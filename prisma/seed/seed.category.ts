import { PrismaClient } from '@prisma/client';

async function seedCategory(prisma: PrismaClient) {
  const categories = [{ category: 'Support' }, { category: 'Feature Request' }];

  await prisma.category.createMany({
    data: categories,
    skipDuplicates: true,
  });

  console.log('Seed des catégories terminé.');
}

export { seedCategory };
