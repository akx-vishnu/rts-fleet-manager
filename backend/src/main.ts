import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with specific options for production compatibility
  app.enableCors({
    origin: true, // Allow all origins (or set to specific like 'http://localhost:3001')
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Add simple connection logger
  app.use((req: any, res: any, next: any) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  const configService = app.get(ConfigService);
  const port = configService.get('PORT') ?? 3000;

  // Listen on 0.0.0.0 to handle both IPv4 and IPv6
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
