/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { generateOpenApiSpecs } from './open-api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // When called with --gen-openapi, generate the OpenAPI spec and exit.
  if (process.argv.includes('--gen-openapi')) {
    await generateOpenApiSpecs(app);
    // Exit early to avoid starting the HTTP server during generation.
    process.exit(0);
  }

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
