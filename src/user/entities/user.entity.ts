import { Email, Phone, Role, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty()
  roles: Role[];

  @ApiProperty({ required: false, nullable: true })
  emails: Email[];

  @ApiProperty({ required: false, nullable: true })
  phones: Phone[];
}
