import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/auth.guard';
import { AuditLogService } from './auditlog.service';
import { LinkedTable } from 'src/shared/enum/linked-table.enum';

@Controller('audit-log')
@ApiTags('audit-log')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get(':linkedTable/:linkedId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({
    description:
      'Retrieve all audit logs for a specific entity by table and ID',
  })
  async findAllByEntity(
    @Param('linkedTable') linkedTable: LinkedTable,
    @Param('linkedId', ParseIntPipe) linkedId: number,
  ) {
    return await this.auditLogService.findAllByEntity(linkedId, linkedTable);
  }
}
