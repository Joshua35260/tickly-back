import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const maxFileSize = 10000000; // Par exemple, 10 m0
    if (value.size > maxFileSize) {
      throw new BadRequestException(
        `File size should not exceed ${maxFileSize / 10000000}KB.`,
      );
    }
    return value;
  }
}
