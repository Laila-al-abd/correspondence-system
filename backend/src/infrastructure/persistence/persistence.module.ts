import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

/**
 * Makes the shared PrismaService available application-wide. Imported once in
 * AppModule; feature modules can inject PrismaService without re-providing it.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PersistenceModule {}
