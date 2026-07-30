import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateModuleItemDto, UpdateModuleItemDto } from './dto/modules.dto';

@Injectable()
export class ModulesService {
  constructor(private firebase: FirebaseService) {}

  private get collection() {
    return this.firebase.getDb().collection('modules');
  }

  async create(teacherId: string, createDto: CreateModuleItemDto): Promise<any> {
    const docRef = await this.collection.add({
      title: createDto.title,
      type: createDto.type || 'tap_the_sound',
      content: createDto.content,
      ageGroup: createDto.ageGroup || 'all',
      teacherId,
      assignedTo: [],
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async findByTeacher(teacherId: string): Promise<any[]> {
    // Returns all modules created by a specific teacher
    const snapshot = await this.collection
      .where('teacherId', '==', teacherId)
      .where('isActive', '==', true)
      .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  private getAgeGroup(age: number): string {
    if (age >= 5 && age <= 7) return '5-7';
    if (age >= 8 && age <= 10) return '8-10';
    if (age >= 11 && age <= 12) return '11-12';
    return 'all';
  }

  async findByAssignedStudent(studentId: string): Promise<any[]> {
    // 1. Get the student's details
    const studentDoc = await this.firebase.getDb().collection('users').doc(studentId).get();
    if (!studentDoc.exists) return [];
    
    const studentData = studentDoc.data()!;
    const teacherId = studentData.teacherId;
    const age = studentData.age;

    // If the student has no teacher assigned, they see no modules
    if (!teacherId) return [];

    const ageGroup = age ? this.getAgeGroup(age) : 'all';

    // 2. Automatically fetch modules created by their teacher for their age group
    // We also fetch modules meant for 'all' age groups
    const snapshot = await this.collection
      .where('teacherId', '==', teacherId)
      .where('isActive', '==', true)
      .get();
      
    // Filter by ageGroup (Firestore limits multiple 'in' queries, so doing it in memory)
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((mod: any) => mod.ageGroup === ageGroup || mod.ageGroup === 'all' || !mod.ageGroup);
  }

  async assignToStudent(teacherId: string, moduleDocId: string, studentId: string): Promise<any> {
    const docRef = this.collection.doc(moduleDocId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Module with ID ${moduleDocId} not found`);
    }

    // Ownership check: only the teacher who created this module can assign it
    if (doc.data()!.teacherId !== teacherId) {
      throw new ForbiddenException('You can only assign modules that you created');
    }

    const currentAssigned: string[] = doc.data()!.assignedTo || [];
    if (!currentAssigned.includes(studentId)) {
      await docRef.update({
        assignedTo: [...currentAssigned, studentId],
        updatedAt: new Date().toISOString(),
      });
    }

    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  async update(teacherId: string, userRole: string, id: string, updateDto: UpdateModuleItemDto): Promise<any> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    // Admins & Superadmins can edit any module; Teachers can only edit their own
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    if (!isAdmin && doc.data()!.teacherId !== teacherId) {
      throw new ForbiddenException('You can only edit modules that you created');
    }

    await docRef.update({ ...updateDto, updatedAt: new Date().toISOString() });
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  async remove(teacherId: string, userRole: string, id: string): Promise<{ message: string }> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }

    // Admins & Superadmins can delete any module; Teachers can only delete their own
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';
    if (!isAdmin && doc.data()!.teacherId !== teacherId) {
      throw new ForbiddenException('You can only delete modules that you created');
    }

    await docRef.delete();
    return { message: `Module ${id} deleted successfully` };
  }
}
