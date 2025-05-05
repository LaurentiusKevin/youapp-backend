import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error'],
  });

  const config = new DocumentBuilder()
    .setTitle('YouApp Code Assessment')
    .setDescription('Laurentius Kevin Hendrawanto - laurentiuskh@gmail.com')
    .setVersion('1.0')
    .build();

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, { autoTagControllers: false });

  SwaggerModule.setup('api', app, documentFactory, {
    swaggerUrl: 'api-docs',
  });

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
