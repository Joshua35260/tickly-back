import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const roundsOfHashing = 10;
async function seedUser(prisma: PrismaClient) {
  // Créez 20 utilisateurs aléatoires
  const users: User[] = [];
  // Créez un utilisateur avec un mot de passe en clair
  const hashedPassword = await bcrypt.hash('test', roundsOfHashing);
  const user1: User = await prisma.user.create({
    data: {
      login: 'jdupin@topics.fr', // Ici, TypeScript va générer une erreur, car "email2" n'existe pas dans le modèle User
      password: hashedPassword, // Utilisez le mot de passe hashé
      firstname: 'Joshua',
      lastname: 'Dupin',
    },
  });
  users.push(user1);

  for (let i = 0; i < 2000; i++) {
    const hashedPassword = await bcrypt.hash(
      faker.internet.password(),
      roundsOfHashing,
    );

    const user: User = await prisma.user.create({
      data: {
        login: faker.internet.email(),
        password: hashedPassword, // Utilisez le mot de passe hashé
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
      },
    });
    users.push(user);
  }
  return users;
}

export { seedUser };
