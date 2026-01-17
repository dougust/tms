import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DrizzleModule } from './modules/database/database.module';
import { FuncionariosModule } from './modules/funcionarios/funcionarios.module';
import { HealthModule } from './modules/health/health.module';
import { DatabaseUtilsModule } from './common/cadastros/database-utils.module';
import { ProjetosModule } from './modules/projetos/projetos.module';
import { EmpresasModule } from './modules/empresas/empresas.module';
import { DiariasModule } from './modules/diarias/diarias.module';
import { LookupsModule } from './modules/lookups/lookups.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthGuard } from './common';

@Module({
  imports: [
    DrizzleModule,
    FuncionariosModule,
    ProjetosModule,
    HealthModule,
    DatabaseUtilsModule,
    EmpresasModule,
    DiariasModule,
    LookupsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
