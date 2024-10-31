import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RoleType } from '../../src/shared/enum/role.enum'; // Assurez-vous que ce chemin est correct

const roundsOfHashing = 10;

function generateFrenchPhoneNumber(): string {
  const prefix = '+33 6'; // Ou '+33 7' pour des numéros mobiles
  const number = Math.floor(600000000 + Math.random() * 900000000).toString(); // Générer 9 chiffres
  return `${prefix} ${number.substring(1)}`; // Retire le premier '0'
}

async function generateUniqueEmail(prisma: PrismaClient): Promise<string> {
  let email;
  let exists = true;

  while (exists) {
    email = faker.internet.email(); // Générer un nouvel e-mail
    exists =
      (await prisma.user.findUnique({ where: { login: email } })) !== null; // Vérifier l'unicité
  }

  return email;
}

async function seedUser(prisma: PrismaClient) {
  const users: User[] = [];

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { role: RoleType.CLIENT },
      update: {},
      create: { role: RoleType.CLIENT },
    }),
    prisma.role.upsert({
      where: { role: RoleType.SUPPORT },
      update: {},
      create: { role: RoleType.SUPPORT },
    }),
  ]);

  const addresses = await prisma.address.findMany();
  const phoneNumber = generateFrenchPhoneNumber();
  // Créez un utilisateur spécifique avec un mot de passe défini
  const hashedPassword = await bcrypt.hash('test', roundsOfHashing);

  const user1: User = await prisma.user.create({
    data: {
      login: 'jdupin@topics.fr',
      password: hashedPassword,
      firstname: 'Joshua',
      lastname: 'Dupin',
      roles: {
        connect: roles
          .filter((role) => role.role === RoleType.SUPPORT)
          .map((role) => ({ role: role.role })),
      },
      email: faker.internet.email(), // Générer un email aléatoire
      phone: phoneNumber, // Attribuer le numéro de téléphone généré
      address: {
        connect: {
          id: addresses[Math.floor(Math.random() * addresses.length)].id,
        }, // Associe une adresse aléatoire
      },
    },
  });
  users.push(user1);

  // Créez 6000 utilisateurs
  for (let i = 0; i < 6000; i++) {
    const hashedPassword = await bcrypt.hash(
      faker.internet.password(),
      roundsOfHashing,
    );

    const user: User = await prisma.user.create({
      data: {
        login: await generateUniqueEmail(prisma),
        password: hashedPassword,
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        roles: {
          connect: roles
            .filter((role) => role.role === RoleType.CLIENT)
            .map((role) => ({ role: role.role })),
        },
        email: faker.internet.email(), // Générer un email aléatoire
        phone: phoneNumber, // Attribuer le numéro de téléphone généré
        address: {
          connect: {
            id: addresses[Math.floor(Math.random() * addresses.length)].id,
          }, // Associe une adresse aléatoire
        },
      },
    });

    // Si l'utilisateur est EMPLOYEE, on le connecte à une structure

    const structureCount = await prisma.structure.count();
    if (structureCount > 0) {
      const randomStructure = await prisma.structure.findFirst({
        skip: Math.floor(Math.random() * structureCount),
      });

      if (randomStructure) {
        await prisma.user.update({
          where: { id: user.id },
          data: { structures: { connect: { id: randomStructure.id } } },
        });
      }
    }

    users.push(user);
  }

  return users;
}

export { seedUser };
