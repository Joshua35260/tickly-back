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
} from '@nestjs/common';
import { StructureService } from './structure.service';
import { CreateStructureDto } from './dto/create-structure.dto';
import { UpdateStructureDto } from './dto/update-structure.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { StructureEntity } from './entities/structure.entity';
import { JwtAuthGuard } from 'src/auth/auth.guard';

@Controller('structure')
export class StructureController {
  constructor(private readonly structureService: StructureService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: StructureEntity })
  create(@Body() createStructureDto: CreateStructureDto) {
    return this.structureService.create(createStructureDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StructureEntity, isArray: true })
  findAll() {
    return this.structureService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StructureEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.structureService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StructureEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStructureDto: UpdateStructureDto,
  ) {
    return this.structureService.update(+id, updateStructureDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: StructureEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.structureService.remove(+id);
  }
}
