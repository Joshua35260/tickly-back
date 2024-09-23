import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

function generateFrenchPhoneNumber(): string {
  const prefix = '+33 6'; // Ou '+33 7' pour des numéros mobiles
  const number = Math.floor(600000000 + Math.random() * 900000000).toString(); // Générer 9 chiffres
  return `${prefix} ${number.substring(1)}`; // Retire le premier '0'
}

async function seedStructure(prisma: PrismaClient) {
  const structures = [];
  const allAddresses = await prisma.address.findMany();

  // Liste des types de structures
  const types = [
    'Société à Responsabilité Limitée (SARL)',
    'Société Anonyme (SA)',
    'Société par Actions Simplifiée (SAS)',
    'Société par Actions Simplifiée Unipersonnelle (SASU)',
    'Entreprise Individuelle (EI)',
    'Auto-entrepreneur (micro-entrepreneur)',
    'Association',
    'Coopérative (SCOP, SCIC)',
    'Fondation',
    "Groupe d'Intérêt Économique (GIE)",
    'Société Civile (SC)',
    'Société Européenne (SE)',
    'Société de fait',
    'Société en Nom Collectif (SNC)',
    'Société en Commandite Simple (SCS)',
  ];

  // Liste des types de services
  const services = [
    'Consultation',
    'Formation',
    'Compatibilité',
    'Développement logiciel',
    'Design graphique',
    'Marketing digital',
    'Services juridiques',
    'Services comptables',
    'Maintenance informatique',
    'Conseil en gestion',
    'Vente de produits',
    'Livraison',
    'Assistance technique',
    'Services de traduction',
    'Événementiel',
  ];

  for (let i = 0; i < 2000; i++) {
    const randomAddressIndex = Math.floor(Math.random() * allAddresses.length);
    const randomAddress = allAddresses[randomAddressIndex];

    // Créer un numéro de téléphone
    const phoneNumber = generateFrenchPhoneNumber();

    const structure = await prisma.structure.create({
      data: {
        name: faker.company.name(),
        type: types[Math.floor(Math.random() * types.length)],
        service: services[Math.floor(Math.random() * services.length)], // Sélectionne un service aléatoire
        emails: {
          create: [
            {
              email: faker.internet.email(),
              type: 'work',
            },
          ],
        },
        phones: {
          create: [
            {
              phone: phoneNumber,
              type: 'mobile', // ou un autre type selon votre logique
            },
          ],
        },
        addresses: { connect: { id: randomAddress.id } },
      },
    });

    structures.push(structure);
  }

  return structures;
}

export { seedStructure };
