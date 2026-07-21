import { Global, Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global() // Makes FirebaseService available to all other modules automatically
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService],
})
export class FirebaseModule {}
