import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DrizzleModule } from './modules/database/database.module';
import { PessoasJuridicasModule } from './modules/pessoas-juridicas/pessoas-juridicas.module';
import { UserContextModule } from './common/user-context/user-context.module';
import { UserContextMiddleware } from './common/user-context/user-context.middleware';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    DrizzleModule,
    PessoasJuridicasModule,
    UserContextModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {


  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UserContextMiddleware).forRoutes('*');
  }
}
