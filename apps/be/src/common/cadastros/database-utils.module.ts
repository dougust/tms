import { Module } from '@nestjs/common';
import { DrizzleModule } from '../../modules/database/database.module';
import { IsUniqueConstraint } from './isUniqueConstraint';

@Module({
  imports: [DrizzleModule],
  controllers: [],
  providers: [IsUniqueConstraint],
  exports: [IsUniqueConstraint],
})
export class DatabaseUtilsModule {}
