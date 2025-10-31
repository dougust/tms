import { Module } from '@nestjs/common';
import { DrizzleModule } from './modules/database/database.module';

@Module({
  imports: [DrizzleModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
