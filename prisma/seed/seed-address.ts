import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

async function seedAddress(prisma: PrismaClient) {
  const addresses = [];

  // Liste de villes françaises avec leurs codes postaux, latitudes et longitudes
  const frenchCities = [
    { city: 'Paris', postcode: '75001', latitude: 48.8566, longitude: 2.3522 },
    {
      city: 'Marseille',
      postcode: '13001',
      latitude: 43.2965,
      longitude: 5.3698,
    },
    { city: 'Lyon', postcode: '69001', latitude: 45.764, longitude: 4.8357 },
    {
      city: 'Toulouse',
      postcode: '31000',
      latitude: 43.6047,
      longitude: 1.4442,
    },
    { city: 'Nice', postcode: '06000', latitude: 43.7102, longitude: 7.262 },
    {
      city: 'Nantes',
      postcode: '44000',
      latitude: 47.2184,
      longitude: -1.5536,
    },
    {
      city: 'Strasbourg',
      postcode: '67000',
      latitude: 48.5734,
      longitude: 7.7521,
    },
    {
      city: 'Montpellier',
      postcode: '34000',
      latitude: 43.6112,
      longitude: 3.8767,
    },
    {
      city: 'Bordeaux',
      postcode: '33000',
      latitude: 44.8378,
      longitude: -0.5792,
    },
    { city: 'Lille', postcode: '59000', latitude: 50.6292, longitude: 3.0573 },
    {
      city: 'Rennes',
      postcode: '35000',
      latitude: 48.1173,
      longitude: -1.6778,
    },
    { city: 'Reims', postcode: '51100', latitude: 49.2583, longitude: 4.0317 },
    {
      city: 'Saint-Étienne',
      postcode: '42000',
      latitude: 45.4397,
      longitude: 4.3872,
    },
    { city: 'Toulon', postcode: '83000', latitude: 43.1242, longitude: 5.928 },
    {
      city: 'Grenoble',
      postcode: '38000',
      latitude: 45.1885,
      longitude: 5.7245,
    },
    { city: 'Dijon', postcode: '21000', latitude: 47.322, longitude: 5.0415 },
    {
      city: 'Angers',
      postcode: '49000',
      latitude: 47.4784,
      longitude: -0.5632,
    },
    { city: 'Nîmes', postcode: '30000', latitude: 43.8367, longitude: 4.3601 },
    {
      city: 'Villeurbanne',
      postcode: '69100',
      latitude: 45.7666,
      longitude: 3.8772,
    },
    {
      city: 'Clermont-Ferrand',
      postcode: '63000',
      latitude: 45.7881,
      longitude: 3.0869,
    },
    {
      city: 'Le Havre',
      postcode: '76600',
      latitude: 49.4944,
      longitude: 0.1079,
    },
    {
      city: 'Perpignan',
      postcode: '66000',
      latitude: 42.6886,
      longitude: 2.8948,
    },
    {
      city: 'Saint-Malo',
      postcode: '35400',
      latitude: 48.648,
      longitude: -2.025,
    }, // Ajout de Saint-Malo
    {
      city: 'La Rochelle',
      postcode: '17000',
      latitude: 46.1603,
      longitude: -1.1511,
    }, // La Rochelle
    {
      city: 'Aix-en-Provence',
      postcode: '13100',
      latitude: 43.5297,
      longitude: 5.4545,
    }, // Aix-en-Provence
    {
      city: 'Ajaccio',
      postcode: '20000',
      latitude: 41.9184,
      longitude: 8.7384,
    }, // Ajaccio
    { city: 'Brest', postcode: '29200', latitude: 48.3882, longitude: -4.4913 }, // Brest
    { city: 'Tours', postcode: '37000', latitude: 47.394, longitude: 0.6848 }, // Tours
    { city: 'Metz', postcode: '57000', latitude: 49.1193, longitude: 6.1752 }, // Metz
  ];

  for (let i = 0; i < 4000; i++) {
    // Sélectionne une ville au hasard dans la liste
    const randomCity =
      frenchCities[Math.floor(Math.random() * frenchCities.length)];
    addresses.push({
      streetL1: faker.location.streetAddress(),
      streetL2: faker.location.secondaryAddress(),
      postcode: randomCity.postcode,
      city: randomCity.city,
      country: 'France',
      latitude: randomCity.latitude,
      longitude: randomCity.longitude,
    });
  }

  // Retourne les adresses générées
  return addresses;
}

export { seedAddress };
