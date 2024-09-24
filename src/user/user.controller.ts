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
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiCreatedResponse({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize?: number, // Pass them to the service, With this setup, you can call the endpoint with optional query parameters like this: sql GET /user?page=2&pageSize=10
  ) {
    const pagination: PaginationDto = {
      page: page || 1, // Default to 1 if not provided
      pageSize: pageSize || 20, // Default to 20 if not provided
    };
    return this.userService.findAll(pagination);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserEntity })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(+id);
  }
}
