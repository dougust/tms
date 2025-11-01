import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { writeFile } from 'fs/promises';
import { INestApplication, Logger } from '@nestjs/common';

export const generateOpenApiSpecs = async <T>(
  app: INestApplication<T>
): Promise<void> => {
  const config = new DocumentBuilder()
    .setTitle('Dougust API')
    .setDescription('Auto-generated OpenAPI specification')
    .setVersion('1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const outPath = join(__dirname, '../../../apps/dougust/dougust-api-specs.json');
  await writeFile(outPath, JSON.stringify(document, null, 2), 'utf8');
  await app.close();
  Logger.log(`✅ OpenAPI spec generated at ${outPath}`);
};
