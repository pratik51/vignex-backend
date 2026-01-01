import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- ALLOW FRONTEND CONNECTIONS (CORS) ---
  app.enableCors(); 

  const config = new DocumentBuilder()
    .setTitle('Vignex API')
    .setDescription('The P2P Custodial Trading API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // FIX: Use the System Port OR 3000
  await app.listen(process.env.PORT || 3000); 
}
bootstrap();