import { IsOptional, IsString, MinLength, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsString()
  @IsOptional()
  @ValidateIf((o) => !!o.password)
  @MinLength(4)
  password: string;
}
