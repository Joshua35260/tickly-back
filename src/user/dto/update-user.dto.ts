import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { RoleType } from 'src/shared/enum/role.enum';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ required: true })
  id: number;

  @IsEnum(RoleType, { each: true })
  @IsNotEmpty()
  @ApiProperty({ required: false, enum: RoleType, isArray: true, default: [] })
  roles: RoleType[];
}
