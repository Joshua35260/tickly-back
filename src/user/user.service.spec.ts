import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JobType } from '../../src/shared/enum/job-type.enum';
import { EmailDto } from '../../src/shared/dto/email.dto';
import { PhoneDto } from '../../src/shared/dto/phone.dto';
import { UserDto } from './dto/user.dto';
import { RoleType } from '../../src/shared/enum/role.enum';

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

    describe('create', () => {
      it('should create a user successfully and return the created user', async () => {
        const createUserDto: CreateUserDto = {
          firstname: 'John',
          lastname: 'Doe',
          login: 'john.doe@example.com',
          password: 'password',
          jobType: JobType.FREELANCE,
          address: {
            country: 'Country',
            city: 'City',
            streetL1: 'Street 1',
            streetL2: 'Street 2',
            postcode: '12345',
          },
          phones: [],
          emails: [],
          structures: [],
        };

        const mockUserResponse: UserDto = {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          jobType: JobType.FREELANCE,
          address: {
            city: 'City',
            country: 'Country',
            postcode: '12345',
            streetL1: 'Street 1',
            streetL2: 'Street 2',
            latitude: null,
            longitude: null,
          },
          emails: [] as EmailDto[],
          phones: [] as PhoneDto[],
          roles: [RoleType.CLIENT],
          structures: [],
        };

        // Mock Prisma's response with the user object you expect to be returned
        mockPrismaService.user.create.mockResolvedValue(mockUserResponse);

        // Call the create method in the service
        const result = await userService.create(createUserDto);

        // Expect the result to match the mock response, not the Prisma structure
        expect(result).toEqual(mockUserResponse);

        // Instead of checking the internals of Prisma create, just check it was called
        expect(mockPrismaService.user.create).toHaveBeenCalled();
      });
    });
  });

  it('should create a user EMPLOYEE successfully withtout address buy with at least one structure and return the created user', async () => {
    const createUserDto: CreateUserDto = {
      firstname: 'John',
      lastname: 'Doe',
      login: 'john.doe@example.com',
      password: 'password',
      jobType: JobType.EMPLOYEE,
      address: null,
      phones: [],
      emails: [],
      structures: [1, 2], // array of structure id, the service will call prisma to make the connexion
    };

    const mockUserResponse: UserDto = {
      id: 1,
      firstname: 'John',
      lastname: 'Doe',
      jobType: JobType.EMPLOYEE,
      address: null,
      emails: [] as EmailDto[],
      phones: [] as PhoneDto[],
      roles: [RoleType.CLIENT],
      structures: [],
    };

    // Mock Prisma's response with the user object you expect to be returned
    mockPrismaService.user.create.mockResolvedValue(mockUserResponse);

    // Call the create method in the service
    const result = await userService.create(createUserDto);

    // Expect the result to match the mock response, not the Prisma structure
    expect(result).toEqual(mockUserResponse);
    // Expect prisma to be called with the correct parameters
    expect(mockPrismaService.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          structures: {
            connect: [{ id: 1 }, { id: 2 }],
          },
        }),
      }),
    );
    // Instead of checking the internals of Prisma create, just check it was called
    expect(mockPrismaService.user.create).toHaveBeenCalled();
  });

  it('should throw BadRequestException if address is missing for freelancers', async () => {
    const createUserDto: CreateUserDto = {
      firstname: 'John',
      lastname: 'Doe',
      login: 'john.doe@example.com',
      password: 'password',
      jobType: JobType.FREELANCE,
      address: null,
      phones: [],
      emails: [],
      structures: [],
    };

    await expect(userService.create(createUserDto)).rejects.toThrow(
      BadRequestException,
    );
    expect(mockPrismaService.user.create).not.toHaveBeenCalled();
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

      // Mocking the $transaction method to return the expected results
      mockPrismaService.$transaction.mockResolvedValue([
        mockUsers, // Result of findMany
        mockUsers.length, // Result of count
      ]);

      const result = await userService.findAll(mockPagination);

      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        total: 2,
        items: mockUsers,
      });

      // Check if the Prisma methods were called
      expect(mockPrismaService.$transaction).toHaveBeenCalledWith([
        expect.anything(), // findMany call
        expect.anything(), // count call
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID with relations included, check what prisma is doing too', async () => {
      const mockUser = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        // Ajoutez d'autres propriétés si nécessaire, mais vous n'avez pas besoin de spécifier 'include'
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
        omit: { password: true },
      });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Simuler un utilisateur non trouvé
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Vérifier que NotFoundException est levée
      await expect(userService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user successfully and return the updated user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstname: 'Jane',
        lastname: 'Doe',
      };

      const mockUser = { id: 1, ...updateUserDto };
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await userService.update(1, updateUserDto);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 },
          data: expect.any(Object),
        }),
      );
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
        omit: { password: true },
      });
    });
  });
});
