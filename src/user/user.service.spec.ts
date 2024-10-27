import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

describe('UserService', () => {
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: 1, firstname: 'John', lastname: 'Doe' },
        { id: 2, firstname: 'Jane', lastname: 'Doe' },
      ];

      const mockPagination = { page: 1, pageSize: 10 };

      // Mocking the response for findMany and count
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(mockUsers.length);

      const result = await userService.findAll(mockPagination);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        items: mockUsers,
      });

      // Check if the Prisma methods were called
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        skip: (mockPagination.page - 1) * mockPagination.pageSize,
        take: mockPagination.pageSize,
      });
      expect(mockPrismaService.user.count).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by ID with relations included', async () => {
      const mockUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
      };

      // Simuler la réponse de Prisma
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Appeler la méthode findOne
      const result = await userService.findOne(1);

      // Vérifier que le résultat correspond au mock
      expect(result).toEqual(mockUser);

      // Vérifiez que findUnique a été appelé avec les bons arguments
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          phones: true,
          emails: true,
          roles: true,
          address: true,
          structures: true,
        },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Simuler un utilisateur non trouvé
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Vérifier que NotFoundException est levée
      await expect(userService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user successfully and return the removed user', async () => {
      const mockUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
      };

      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      const result = await userService.remove(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
