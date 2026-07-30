import { Injectable, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getStorage, Storage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firestore: Firestore;
  private auth: Auth;
  private storage: Storage;

  onModuleInit() {
    // 1. Point to the secure key file in the root of the backend folder
    const serviceAccountPath = path.resolve(process.cwd(), 'firebase-key.json');

    // 2. Initialize the Firebase Admin SDK
    if (getApps().length === 0) {
      initializeApp({
        credential: cert(serviceAccountPath),
        storageBucket: 'literacy-app-dd6d3.appspot.com'
      });
    }

    // 3. Store references to the Database, Auth, and Storage services
    this.firestore = getFirestore();
    this.auth = getAuth();
    this.storage = getStorage();
    
    console.log('✅ Successfully connected to Firebase Firestore!');
  }

  getDb(): Firestore {
    return this.firestore;
  }

  getAuth(): Auth {
    return this.auth;
  }

  getStorage(): Storage {
    return this.storage;
  }
}
