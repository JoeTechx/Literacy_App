import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto, UpdateUserDto, UserRole } from './dto/user.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { EmailService } from '../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private firebase: FirebaseService,
    private emailService: EmailService,
  ) {}

  private get collection() {
    return this.firebase.getDb().collection('users');
  }

  async create(createUserDto: CreateUserDto): Promise<any> {
    const existing = await this.collection
      .where('email', '==', createUserDto.email)
      .limit(1)
      .get();

    if (!existing.empty) {
      throw new ConflictException('A user with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const role = createUserDto.role || UserRole.STUDENT;
    
    // Generate verification token if it's a staff member
    const isStaff = role === UserRole.SUPERADMIN || role === UserRole.ADMIN || role === UserRole.TEACHER;
    const verificationToken = isStaff ? crypto.randomBytes(32).toString('hex') : null;

    const userDoc = {
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      role: role,
      totalPoints: 0,
      avatar: createUserDto.avatar || null,
      age: createUserDto.age || null,
      teacherId: createUserDto.teacherId || null,
      isVerified: !isStaff, // Students are auto-verified
      verificationToken: verificationToken,
      createdAt: new Date().toISOString(),
    };

    const docRef = await this.collection.add(userDoc);
    
    if (isStaff && verificationToken) {
      await this.emailService.sendVerificationEmail(createUserDto.email, verificationToken, createUserDto.name);
    }
    
    const { password, ...safeUser } = userDoc;
    return { id: docRef.id, ...safeUser };
  }

  async findAll(): Promise<any[]> {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => {
      const { password, ...data } = doc.data();
      return { id: doc.id, ...data };
    });
  }

  async findByRole(role: UserRole): Promise<any[]> {
    const snapshot = await this.collection.where('role', '==', role).get();
    return snapshot.docs.map(doc => {
      const { password, ...data } = doc.data();
      return { id: doc.id, ...data };
    });
  }

  async findStudentsByTeacher(teacherId: string): Promise<any[]> {
    // Returns only students assigned to this specific teacher
    const snapshot = await this.collection
      .where('role', '==', UserRole.STUDENT)
      .where('teacherId', '==', teacherId)
      .get();
    return snapshot.docs.map(doc => {
      const { password, ...data } = doc.data();
      return { id: doc.id, ...data };
    });
  }

  async findByEmail(email: string): Promise<any | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async findByVerificationToken(token: string): Promise<any | null> {
    const snapshot = await this.collection.where('verificationToken', '==', token).limit(1).get();
    if (snapshot.empty) return null;
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }

  async findById(id: string): Promise<any> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, ...data } = doc.data() as any;
    return { id: doc.id, ...data };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    const docRef = this.collection.doc(id);
    if (!(await docRef.get()).exists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await docRef.update({ ...updateUserDto, updatedAt: new Date().toISOString() });
    const { password, ...data } = (await docRef.get()).data() as any;
    return { id: docRef.id, ...data };
  }

  async assignStudentToTeacher(studentId: string, teacherId: string): Promise<any> {
    // Admin action: link a student document to a teacher
    return this.update(studentId, { teacherId } as any);
  }

  async remove(id: string): Promise<{ message: string }> {
    const docRef = this.collection.doc(id);
    if (!(await docRef.get()).exists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    await docRef.delete();
    return { message: `User ${id} deleted successfully` };
  }
}
