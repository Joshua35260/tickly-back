import { Address, Email, JobType, Phone, Role, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { RoleType } from 'src/shared/enum/role.enum';

export class UserEntity implements User {
  @ApiProperty({ nullable: false })
  id: number;

  @ApiProperty({ nullable: false })
  login: string;

  @ApiProperty({ nullable: false })
  password: string;

  @ApiProperty({ nullable: false })
  firstname: string;

  @ApiProperty({ nullable: false })
  lastname: string;

  @ApiProperty({ required: false, enum: RoleType, isArray: true })
  roles: Role[];

  @ApiProperty({ required: false, nullable: true })
  emails: Email[];

  @ApiProperty({ required: false, nullable: true })
  phones: Phone[];

  @ApiProperty({ required: false, nullable: false })
  addressId: number;

  @ApiProperty({ required: false, nullable: false })
  address: Address;

  @ApiProperty({ required: false, nullable: false })
  jobTypeId: string;

  @ApiProperty({ required: false, nullable: false })
  jobType: JobType;
}
