import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ModulesModule } from './modules/modules.module';
import { ProgressModule } from './progress/progress.module';
import { UploadModule } from './upload/upload.module';
import { FirebaseModule } from './firebase/firebase.module';
import { EmailModule } from './email/email.module';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // Loads .env variables globally across all modules
    ConfigModule.forRoot({ isGlobal: true }),

    // Firebase connection using firebase-key.json
    FirebaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ModulesModule,
    ProgressModule,
    UploadModule,
    EmailModule,
  ],
  providers: [
    // Registers RolesGuard globally so it applies automatically to all routes
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
