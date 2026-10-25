import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(new ValidationPipe());
   await app.listen(process.env.PORT ?? 3000);
}
// await bootstrap();
bootstrap().catch((error) => {
  console.error('NestJS startup failed:', error);
  process.exitCode = 1;
});
