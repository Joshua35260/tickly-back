import { PrismaClient, Ticket } from '@prisma/client';
import { faker } from '@faker-js/faker';

async function seedTicket(prisma: PrismaClient) {
  const tickets: Ticket[] = [];

  // Récupérer les catégories, priorités et statuts existants
  const categories = await prisma.category.findMany();
  const priorities = await prisma.priority.findMany();
  const statuses = await prisma.status.findMany();
  const users = await prisma.user.findMany(); // Récupérer les utilisateurs pour assigner les auteurs des tickets

  if (
    !categories.length ||
    !priorities.length ||
    !statuses.length ||
    !users.length
  ) {
    throw new Error(
      'Please make sure to have categories, priorities, statuses, and users populated in your database.',
    );
  }

  for (let i = 0; i < 1000; i++) {
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomPriority =
      priorities[Math.floor(Math.random() * priorities.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const ticket: Ticket = await prisma.ticket.create({
      data: {
        description: faker.lorem.sentence(10), // Générer une description aléatoire
        archivedAt: Math.random() > 0.9 ? faker.date.past() : null, // 10% de chances d'avoir un ticket archivé
        status: {
          connect: { id: randomStatus.id }, // Associer à un statut aléatoire
        },
        priority: {
          connect: { id: randomPriority.id }, // Associer à une priorité aléatoire
        },
        category: {
          connect: { id: randomCategory.id }, // Associer à une catégorie aléatoire
        },
        author: {
          connect: { id: randomUser.id }, // Associer à un utilisateur (auteur) aléatoire
        },
      },
    });

    tickets.push(ticket);
  }

  console.log(`1000 tickets have been created.`);
  return tickets;
}
export { seedTicket };
