import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTicketDto } from './create-ticket.dto';
import { IsNumber, IsNotEmpty } from 'class-validator';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ nullable: false })
  id: number;
}
