import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';

export class AuthEntity {
  @ApiProperty()
  token: string;
  @ApiProperty()
  expire: number;
  @ApiProperty()
  user: User;
}
