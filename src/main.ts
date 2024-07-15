import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  // const httpAdapter = app.get(HttpAdapterHost);
  // app.useGlobalFilters(new AllExceptionsFilter(httpAdapter) , new HttpExceptionFilter());
  
  const options = new DocumentBuilder()
  .setTitle('Agrovendors API')
  .setDescription('An API to create agrigultural offers.')
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
