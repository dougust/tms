import { Module } from '@nestjs/common';
import { UserContextModule } from '../user-context/user-context.module';
import { DrizzleModule } from '../../modules/database/database.module';
import { IsUniqueConstraint } from './isUniqueConstraint';

@Module({
  imports: [DrizzleModule, UserContextModule],
  controllers: [],
  providers: [IsUniqueConstraint],
  exports: [IsUniqueConstraint],
})
export class DatabaseUtilsModule {}
