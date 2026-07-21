import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PersistenceModule } from './infrastructure/persistence/persistence.module';
import { CatalogModule } from './interface/catalog/catalog.module';
import { IdentityModule } from './interface/identity/identity.module';
import { OrganizationModule } from './interface/organization/organization.module';
import { WorkflowModule } from './interface/workflow/workflow.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersistenceModule,
    CatalogModule,
    IdentityModule,
    OrganizationModule,
    WorkflowModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
