import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { ExceptionsFilter } from './filters/exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'],
  });

  app.enableCors();
  app.setGlobalPrefix('/api');
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));  
  app.useGlobalFilters(new ExceptionsFilter());

  const options = new DocumentBuilder()
      .setTitle('Yasuke API') 
      .setDescription('API endpoints for Yasuke NFT Platform')
      .setVersion('1.0.0')
      .addTag('yasuke')      
      .addApiKey({
        type: 'apiKey', // this should be apiKey
        name: 'api-key', // this is the name of the key you expect in header
        in: 'header',
      }, 'api-key') 
      .build();
  
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(process.env.PORT);
}

bootstrap();
