import { Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: Firestore;
  private auth: Auth;

  onModuleInit() {
    // 1. Point to the secure key file in the root of the backend folder
    const serviceAccountPath = path.resolve(process.cwd(), 'firebase-key.json');

    // 2. Initialize the Firebase Admin SDK
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccountPath),
      });
    }

    // 3. Store references to the Database and Auth services
    this.firestore = getFirestore();
    this.auth = getAuth();
    
    console.log('✅ Successfully connected to Firebase Firestore!');
  }

  getDb(): Firestore {
    return this.firestore;
  }

  getAuth(): Auth {
    return this.auth;
  }
}
