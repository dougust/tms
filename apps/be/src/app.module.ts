import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DrizzleModule } from './modules/database/database.module';
import { FuncionariosModule } from './modules/funcionarios/funcionarios.module';
import { UserContextModule } from './common/user-context/user-context.module';
import { UserContextMiddleware } from './common/user-context/user-context.middleware';
import { HealthModule } from './modules/health/health.module';
import { DatabaseUtilsModule } from './common/cadastros/database-utils.module';
import { ProjetosModule } from './modules/projetos/projetos.module';
import { EmpresasModule } from './modules/empresas/empresas.module';

@Module({
  imports: [
    DrizzleModule,
    FuncionariosModule,
    ProjetosModule,
    UserContextModule,
    HealthModule,
    DatabaseUtilsModule,
    EmpresasModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UserContextMiddleware).forRoutes('*');
  }
}
