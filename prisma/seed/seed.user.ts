import { faker } from '@faker-js/faker';
import { PrismaClient, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { RoleType } from '../../src/shared/enum/role.enum'; // Assurez-vous que ce chemin est correct
import { JobType } from '../../src/shared/enum/job-type.enum';

const roundsOfHashing = 10;

function generateFrenchPhoneNumber(): string {
  const prefix = '+33 6'; // Ou '+33 7' pour des numéros mobiles
  const number = Math.floor(600000000 + Math.random() * 900000000).toString(); // Générer 9 chiffres
  return `${prefix} ${number.substring(1)}`; // Retire le premier '0'
}

async function generateUniqueEmail(prisma: PrismaClient): Promise<string> {
  let email;
  do {
    email = faker.internet.email(); // Générer un nouvel e-mail
  } while (await prisma.user.findUnique({ where: { login: email } })); // Vérifier l'unicité
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

  const jobTypes = await Promise.all([
    prisma.jobType.upsert({
      where: { jobType: JobType.FREELANCE },
      update: {},
      create: { jobType: JobType.FREELANCE },
    }),
    prisma.jobType.upsert({
      where: { jobType: JobType.EMPLOYEE },
      update: {},
      create: { jobType: JobType.EMPLOYEE },
    }),
  ]);

  const addresses = await prisma.address.findMany();

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
      phones: {
        create: [{ phone: generateFrenchPhoneNumber(), type: 'mobile' }],
      },
      emails: { create: [{ email: faker.internet.email(), type: 'work' }] },
      jobType: {
        connect: {
          jobType: JobType.FREELANCE,
        },
      },
      address: {
        connect: {
          id: addresses[Math.floor(Math.random() * addresses.length)].id,
        }, // Associe une adresse aléatoire
      },
    },
  });
  users.push(user1);

  // Créez 2000 utilisateurs
  for (let i = 0; i < 2000; i++) {
    const hashedPassword = await bcrypt.hash(
      faker.internet.password(),
      roundsOfHashing,
    );

    const userJobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];

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
        phones: {
          create: [{ phone: generateFrenchPhoneNumber(), type: 'mobile' }],
        },
        emails: { create: [{ email: faker.internet.email(), type: 'work' }] },
        jobType: {
          connect: {
            jobType: userJobType.jobType, // Assurez-vous que cela correspond à la structure attendue
          },
        },
        address: {
          connect: {
            id: addresses[Math.floor(Math.random() * addresses.length)].id,
          }, // Associe une adresse aléatoire
        },
      },
    });

    // Si l'utilisateur est EMPLOYEE, on le connecte à une structure
    if (userJobType.jobType === JobType.EMPLOYEE) {
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
    }

    users.push(user);
  }

  return users;
}

export { seedUser };
