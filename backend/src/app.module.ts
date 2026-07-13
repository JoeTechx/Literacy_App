import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ModulesModule } from './modules/modules.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [
    // ── Environment Variables (loads .env automatically)
    ConfigModule.forRoot({
      isGlobal: true,  // Available in every module without re-importing
    }),

    // ── MongoDB Connection (async so it reads from .env)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // ── Feature Modules
    AuthModule,
    UsersModule,
    ModulesModule,
    ProgressModule,
  ],
})
export class AppModule {}
