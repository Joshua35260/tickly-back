import { PrismaClient, Ticket } from '@prisma/client';
import { faker } from '@faker-js/faker';

async function seedTicket(prisma: PrismaClient) {
  const tickets: Ticket[] = [];

  const categories = ['SUPPORT', 'FEATURE_REQUEST'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH'];
  const statuses = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

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
    const randomCategories = [
      categories[Math.floor(Math.random() * categories.length)],
    ]; // Picks one random category from the array
    const randomPriority =
      priorities[Math.floor(Math.random() * priorities.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomUser = users[Math.floor(Math.random() * users.length)];

    const ticket: Ticket = await prisma.ticket.create({
      data: {
        description: faker.lorem.sentence(10), // Generate a random description
        archivedAt: Math.random() > 0.9 ? faker.date.past() : null, // 10% chance of being archived
        status: randomStatus, // Assign a random status as a string
        priority: randomPriority, // Assign a random priority as a string
        category: randomCategories, // Assign a random category as an array of strings
        author: {
          connect: { id: randomUser.id }, // Connect to a random user as author
        },
      },
    });

    tickets.push(ticket);
  }

  console.log(`1000 tickets have been created.`);
  return tickets;
}
export { seedTicket };
