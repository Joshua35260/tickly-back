import { Email, Phone, Role, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from 'src/shared/enum/role.enum';

export class UserEntity implements User {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty({ required: false, enum: RoleType, isArray: true })
  roles: Role[];

  @ApiProperty({ required: false, nullable: true })
  emails: Email[];

  @ApiProperty({ required: false, nullable: true })
  phones: Phone[];
}
