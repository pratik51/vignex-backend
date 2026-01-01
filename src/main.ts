import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- ALLOW FRONTEND CONNECTIONS (CORS) ---
  app.enableCors(); 
  // This opens the door for your React app to fetch data.

  const config = new DocumentBuilder()
    .setTitle('Vignex API')
    .setDescription('The P2P Custodial Trading API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();