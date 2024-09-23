import { ApiProperty } from '@nestjs/swagger';
import { Email, Phone, Structure } from '@prisma/client';
export class StructureEntity implements Structure {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;

  @ApiProperty({ required: false, nullable: true })
  service: string;

  @ApiProperty({ required: false, nullable: true })
  emails: Email[];

  @ApiProperty({ required: false, nullable: true })
  phones: Phone[];
}
