import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { AuthenticatedRequest } from 'src/auth/auth.service';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() request?: AuthenticatedRequest,
  ) {
    return this.userService.create(createUserDto, request);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  @ApiExtraModels(PaginationDto, FilterUserDto)
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters?: FilterUserDto,
    @Query('sort') sort?: string,
  ) {
    return this.userService.findAll(pagination, filters, sort);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  @ApiExtraModels(PaginationDto, FilterUserDto)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.update(id, updateUserDto, request);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }

  // *** Ajouter une structure à un utilisateur ***
  @Post(':userId/structures/:structureId')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'Structure added to user',
    type: UserEntity,
  })
  addStructureToUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('structureId', ParseIntPipe) structureId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.addStructureToUser(userId, structureId, request);
  }

  // *** Retirer une structure d'un utilisateur ***
  @Delete(':userId/structures/:structureId')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth()
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Structure removed from user',
    type: UserEntity,
  })
  removeStructureFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('structureId', ParseIntPipe) structureId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.userService.removeStructureFromUser(
      userId,
      structureId,
      request,
    );
  }
}
