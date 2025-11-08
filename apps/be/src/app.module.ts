import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DrizzleModule } from './modules/database/database.module';
import { FuncionariosModule } from './modules/funcionarios/funcionarios.module';
import { UserContextModule } from './common/user-context/user-context.module';
import { UserContextMiddleware } from './common/user-context/user-context.middleware';
import { HealthModule } from './modules/health/health.module';
import { DatabaseUtilsModule } from './common/cadastros/database-utils.module';
import { ProjetosModule } from './modules/projetos/projetos.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { DiariasModule } from './modules/diarias/diarias.module';
import { TiposDiariaModule } from './modules/tipos-diaria/tipos-diaria.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './common/guards/auth.guard';
import { TenantGuard } from './common/guards/tenant.guard';

@Module({
  imports: [
    DrizzleModule,
    FuncionariosModule,
    ProjetosModule,
    UserContextModule,
    HealthModule,
    DatabaseUtilsModule,
    EmpresasModule,
    DiariasModule,
    TiposDiariaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    // { provide: APP_GUARD, useClass: TenantGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UserContextMiddleware).forRoutes('*');
  }
}
