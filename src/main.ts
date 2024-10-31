import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = isProduction
        ? ['https://tickly.cloud', 'http://localhost:4200']
        : ['http://localhost:4200'];

      // Vérifiez si l'origine est dans la liste des origines autorisées
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Autoriser l'origine
      } else {
        callback(new Error('Not allowed by CORS')); // Refuser l'origine
      }
    },
    credentials: true, // Autoriser les cookies
  });

  app.setGlobalPrefix('api'); // Définir le préfixe global pour toutes les routes
  app.use(cookieParser()); // cookie parser middleware
  app.useGlobalPipes(new ValidationPipe({ whitelist: true })); //whitelist true = supprime les champs non renseignés

  const config = new DocumentBuilder()
    .setTitle('Tickly API')
    .setDescription('The Tickly API description')
    .setVersion('0.1')
    .addCookieAuth('Tickly') // Utilisez le nom du cookie approprié ici
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter)); // use prisma client exception filter globally for all controllers

  await app.listen(3000);
}
bootstrap();
