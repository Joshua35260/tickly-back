import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    console.error(exception.message);
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = exception.message.replace(/\n/g, '');
    switch (exception.code) {
      case 'P2000':
        // Generic database connection error
        return this.handleError(
          response,
          HttpStatus.INTERNAL_SERVER_ERROR,
          message,
        );
      case 'P2001':
        // Invalid connection string
        return this.handleError(
          response,
          HttpStatus.INTERNAL_SERVER_ERROR,
          message,
        );
      case 'P2025':
        // Record not found
        return this.handleError(response, HttpStatus.NOT_FOUND, message);
      case 'P2002':
        // Unique constraint violation
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2003':
        // Foreign key constraint violation
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2004':
        // Unique constraint violation during upsert
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2005':
        // Multiple records were found for unique constraint
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2006':
        // Foreign key constraint violation during update
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2007':
        // A required field was not provided
        return this.handleError(response, HttpStatus.BAD_REQUEST, message);
      case 'P2008':
        // Unique constraint violation during create
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2009':
        // Record not found
        return this.handleError(response, HttpStatus.NOT_FOUND, message);
      case 'P2010':
        // Unique constraint violation during connectOrCreate
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2011':
        // A required relation was not provided
        return this.handleError(response, HttpStatus.BAD_REQUEST, message);
      case 'P2012':
        // Unique constraint violation during updateMany
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2013':
        // Unique constraint violation during deleteMany
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2014':
        // Unique constraint violation during delete
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2015':
        // A required field was not provided during connect
        return this.handleError(response, HttpStatus.BAD_REQUEST, message);
      case 'P2016':
        // Unique constraint violation during upsertMany
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2017':
        // Unique constraint violation during update
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2018':
        // Invalid value provided for field
        return this.handleError(response, HttpStatus.BAD_REQUEST, message);
      case 'P2019':
        // Record already exists
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2020':
        // Record could not be deleted because it has dependent records
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2021':
        // Record could not be updated because it would violate a relation's unique constraint
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2022':
        // Record could not be updated because it would violate a relation's unique constraint during connect
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2023':
        // Invalid field value during connect
        return this.handleError(response, HttpStatus.BAD_REQUEST, message);
      case 'P2024':
        // Record could not be updated because it would violate a relation's unique constraint during disconnect
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2025':
        // Record not found
        return this.handleError(response, HttpStatus.NOT_FOUND, message);
      case 'P2026':
        // Record could not be updated because it would violate a relation's unique constraint during set
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2027':
        // Record could not be deleted because it would violate a relation's unique constraint during delete
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2028':
        // Record could not be updated because it would violate a relation's unique constraint during update
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2029':
        // Unique constraint violation during createMany
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2030':
        // Unique constraint violation during connect
        return this.handleError(response, HttpStatus.CONFLICT, message);
      case 'P2031':
        // Record could not be created because it would violate a relation's unique constraint during create
        return this.handleError(response, HttpStatus.CONFLICT, message);
      default:
        // Default error handling
        return this.handleError(
          response,
          HttpStatus.INTERNAL_SERVER_ERROR,
          message,
        );
    }
  }

  private handleError(response: Response, status: HttpStatus, message: string) {
    response.status(status).json({
      statusCode: status,
      message: message,
    });
  }
}
