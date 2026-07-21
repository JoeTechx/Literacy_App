import { Injectable } from '@nestjs/common';
import { UpdateProgressDto } from './dto/progress.dto';
import { UsersService } from '../users/users.service';
import { FirebaseService } from '../firebase/firebase.service';
import { DocumentReference } from 'firebase-admin/firestore';

@Injectable()
export class ProgressService {
  constructor(
    private firebase: FirebaseService,
    private usersService: UsersService,
  ) {}

  private get collection() {
    return this.firebase.getDb().collection('progress');
  }

  async getUserProgress(userId: string): Promise<any[]> {
    // Fetch all progress records for a specific user
    const snapshot = await this.collection.where('userId', '==', userId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async updateProgress(userId: string, updateDto: UpdateProgressDto): Promise<any> {
    const { moduleId, score = 0, attempts = 0, isCompleted } = updateDto;

    // 1. Find existing progress for this specific module and user
    const snapshot = await this.collection
      .where('userId', '==', userId)
      .where('moduleId', '==', moduleId)
      .limit(1)
      .get();

    let docRef: DocumentReference;

    if (snapshot.empty) {
      // 2a. Create a brand new progress record if they haven't played this module yet
      docRef = await this.collection.add({
        userId,
        moduleId,
        score,
        attempts,
        isCompleted: isCompleted || false,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // 2b. Update the existing progress record
      docRef = snapshot.docs[0].ref as DocumentReference;
      const data = snapshot.docs[0].data();
      
      await docRef.update({
        score: data.score + score,
        attempts: data.attempts + attempts,
        isCompleted: isCompleted !== undefined ? isCompleted : data.isCompleted,
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. If they gained points, correctly update their global totalPoints in the Users collection
    if (score > 0) {
      const user = await this.usersService.findById(userId);
      await this.usersService.update(userId, { totalPoints: (user.totalPoints || 0) + score });
    }

    const updatedDoc = await docRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }
}
