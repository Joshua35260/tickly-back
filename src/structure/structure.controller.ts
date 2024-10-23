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
import { StructureService } from './structure.service';
import { CreateStructureDto } from './dto/create-structure.dto';
import { UpdateStructureDto } from './dto/update-structure.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { StructureEntity } from './entities/structure.entity';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { AuthenticatedRequest } from 'src/auth/auth.service';
import { FilterStructureDto } from './dto/filter-structure.dto';

@Controller('structure')
@ApiTags('structure')
export class StructureController {
  constructor(private readonly structureService: StructureService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: StructureEntity })
  create(
    @Body() createStructureDto: CreateStructureDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.structureService.create(createStructureDto, request);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StructureEntity, isArray: true })
  @ApiExtraModels(PaginationDto, FilterStructureDto) // Indiquer à Swagger d'utiliser ce DTO
  findAll(
    @Query() pagination: PaginationDto,
    @Query() filters?: FilterStructureDto,
  ) {
    return this.structureService.findAll(pagination, filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StructureEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.structureService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StructureEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: AuthenticatedRequest,
    @Body() updateStructureDto: UpdateStructureDto,
  ) {
    return this.structureService.update(id, updateStructureDto, request);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StructureEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.structureService.remove(id);
  }

  // *** Ajouter un utilisateur à une structure ***
  @Post(':structureId/users/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'User added to structure',
    type: StructureEntity,
  })
  addUserToStructure(
    @Param('structureId', ParseIntPipe) structureId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.structureService.addUserToStructure(
      structureId,
      userId,
      request,
    );
  }

  // *** Retirer un utilisateur d'une structure ***
  @Delete(':structureId/users/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'User removed from structure',
    type: StructureEntity,
  })
  removeUserFromStructure(
    @Param('structureId', ParseIntPipe) structureId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.structureService.removeUserFromStructure(
      structureId,
      userId,
      request,
    );
  }
}
