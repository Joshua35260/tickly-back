import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, NotFoundException } from '@nestjs/common';
import { TicketModule } from './ticket.module';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../../src/auth/auth.guard';

describe('TicketController (e2e)', () => {
  let app: INestApplication;

  const ticketService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [TicketModule],
    })
      .overrideProvider(TicketService)
      .useValue(ticketService)
      .overrideGuard(JwtAuthGuard) // Ignore le JwtAuthGuard
      .useValue({ canActivate: jest.fn(() => true) }) // Mock la méthode canActivate pour qu'elle retourne true
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });
  beforeEach(() => {
    jest.clearAllMocks(); // Réinitialise tous les mocks avant chaque test
  });

  describe('/POST ticket', () => {
    it('should create a new ticket', async () => {
      const createTicketDto: CreateTicketDto = {
        description: 'New Ticket',
        priority: { id: 1, priority: 'LOW' },
        status: { id: 1, status: 'OPEN' },
        category: [{ id: 1, category: 'BUG' }],
        authorId: 1,
      };

      // Mock de l'appel à Prisma pour créer un ticket
      ticketService.create.mockResolvedValue({
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
        statusId: 1,
        priorityId: 1,
        authorId: createTicketDto.authorId,
        description: createTicketDto.description,
      });

      // Appel à l'API pour créer un ticket
      return request(app.getHttpServer())
        .post('/ticket')
        .send(createTicketDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.description).toEqual(createTicketDto.description);
        });
    });
  });

  describe('/DELETE ticket/:id', () => {
    it('should delete a ticket', async () => {
      const ticketId = 1000; // ID du ticket à tester

      // Mock l'appel à Prisma pour supprimer un ticket
      ticketService.remove.mockResolvedValue({
        id: ticketId,
        description:
          'Socius claustrum claro vix voluntarius celer terga cito porro consuasor.',
        createdAt: new Date(),
        updatedAt: new Date(),
        archivedAt: null,
        statusId: 1,
        priorityId: 2,
        authorId: 1364,
      });

      return request(app.getHttpServer())
        .delete(`/ticket/${ticketId}`) // Suppression du ticket
        .expect(200) // Attendre un code de réponse 200
        .expect((res) => {
          expect(res.body).toHaveProperty('id', ticketId); // Vérifier l'ID
          expect(res.body.description).toBe(
            'Socius claustrum claro vix voluntarius celer terga cito porro consuasor.',
          ); // Vérifiez la description
          // Vérifiez les autres propriétés si nécessaire
          expect(res.body).toHaveProperty('statusId', 1);
          expect(res.body).toHaveProperty('priorityId', 2);
          expect(res.body).toHaveProperty('authorId', 1364);
        });
    });
  });

  describe('/GET tickets', () => {
    it('should return paginated tickets', async () => {
      const mockTickets = [
        {
          id: 1,
          description: 'Test Ticket',
          priorityId: 1,
          statusId: 1,
          authorId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          archivedAt: new Date(),
          priority: { id: 1, priority: 'LOW' },
          status: { id: 1, status: 'OPEN' },
          category: [{ id: 1, category: 'BUG' }],
          author: { id: 1 },
        },
      ];

      // Simulez la réponse attendue du service
      const paginationResponse = {
        page: 1,
        pageSize: 20,
        total: 999,
        items: mockTickets,
      };

      // Mock l'appel à Prisma pour récupérer les tickets
      ticketService.findAll.mockResolvedValue(paginationResponse); // Utilisez le service mocké

      return request(app.getHttpServer())
        .get('/ticket')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('items'); // Vérifie la propriété 'items'
          expect(res.body.items).toBeInstanceOf(Array); // Vérifie que 'items' est un tableau
          expect(res.body.items[0]).toHaveProperty('id'); // Vérifie que le premier ticket a une propriété 'id'
          expect(res.body).toHaveProperty('page', 1); // Vérifie la propriété 'page'
          expect(res.body).toHaveProperty('pageSize', 20); // Vérifie la propriété 'pageSize'
          expect(res.body).toHaveProperty('total', 999); // Vérifie la propriété 'total'
        });
    });
  });

  describe('/GET ticket/:id', () => {
    it('should return a ticket by ID', async () => {
      const ticketId = 1;
      const mockTicket = {
        id: ticketId,
        description: 'Test Ticket',
        priorityId: 1,
        statusId: 1,
        authorId: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archivedAt: new Date().toISOString(),
        priority: { id: 1, priority: 'LOW' },
        status: { id: 1, status: 'OPEN' },
        category: [{ id: 1, category: 'BUG' }],
        author: {
          id: 1,
          firstname: 'Test',
          lastname: 'User',
          login: 'test.user@example.com',
          addressId: 1,
          address: {
            id: 1,
            country: 'France',
            postcode: '67000',
            city: 'Strasbourg',
            streetL1: '7710 Aiden Underpass',
            streetL2: 'Suite 604',
            longitude: '7.7521',
            latitude: '48.5734',
          },
        },
      };

      // Mock l'appel à la méthode findOne du service
      ticketService.findOne.mockResolvedValue(mockTicket);

      await request(app.getHttpServer())
        .get(`/ticket/${ticketId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockTicket);
        });

      expect(ticketService.findOne).toHaveBeenCalledWith(ticketId);
    });

    it('should return 404 if ticket not found', async () => {
      const ticketId = 9999999; // ID qui n'existe pas
      ticketService.findOne.mockResolvedValue(null); // Simule un ticket non trouvé

      await request(app.getHttpServer())
        .get(`/ticket/${ticketId}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toBe(`Ticket with ID ${ticketId} not found`);
        });

      expect(ticketService.findOne).toHaveBeenCalledWith(ticketId);
    });
  });

  describe('/PATCH ticket/:id', () => {
    const updateTicketDto: UpdateTicketDto = {
      description: 'Updated Ticket',
      status: { id: 3, status: 'Closed' },
      category: [{ id: 2, category: 'Feature Request' }],
      priority: { id: 1, priority: 'Low' },
      authorId: 613,
    };
    const mockTicketId = 1;
    it('should update a ticket', async () => {
      // ID du ticket à mettre à jour
      // Simuler la méthode update du service de ticket
      ticketService.update = jest.fn().mockResolvedValue({
        ...updateTicketDto, // La nouvelle description
        id: mockTicketId, // ID du ticket mis à jour
        // Vous pouvez ajouter d'autres champs si nécessaire
      });

      // Appelez l'endpoint PATCH pour mettre à jour le ticket
      const response = await request(app.getHttpServer())
        .patch(`/ticket/${mockTicketId}`)
        .send(updateTicketDto) // Envoyez uniquement la nouvelle description
        .expect(200); // Vérifiez que le code de statut est 200

      // Vérifiez que la réponse contient les données mises à jour
      expect(response.body).toEqual({
        ...updateTicketDto, // Doit inclure la nouvelle description
        id: mockTicketId, // Vérifiez que l'ID est également inclus
        // Vérifiez d'autres champs si nécessaire
      });

      // Vérifiez que la méthode update a été appelée avec les bons arguments
      expect(ticketService.update).toHaveBeenCalledWith(
        mockTicketId,
        updateTicketDto,
        expect.anything(),
      );
    });
  });
  it('should return 404 if ticket not found', async () => {
    const nonExistentTicketId = 99999999; // ID qui n'existe pas
    const updateTicketDto: UpdateTicketDto = {
      description: 'Updated Ticket',
    };
    // Simulez que la méthode findUnique retourne null
    ticketService.findOne = jest.fn().mockResolvedValue(null);

    // Simulez que la méthode update lance une exception NotFound
    ticketService.update = jest
      .fn()
      .mockRejectedValue(
        new NotFoundException(
          `Ticket with ID ${nonExistentTicketId} not found`,
        ),
      );

    // Appelez l'endpoint PATCH pour l'ID de ticket non existant
    await request(app.getHttpServer())
      .patch(`/ticket/${nonExistentTicketId}`)
      .send(updateTicketDto)
      .expect(404) // Vérifiez que le code de statut est 404
      .expect((res) => {
        expect(res.body.message).toBe(
          `Ticket with ID ${nonExistentTicketId} not found`,
        ); // Vérifiez que le message est correct
      });

    expect(ticketService.update).toHaveBeenCalledWith(
      nonExistentTicketId,
      updateTicketDto,
      expect.anything(), // equal to auth request
    );
  });
});
