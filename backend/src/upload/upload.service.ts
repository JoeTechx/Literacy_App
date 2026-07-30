import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class UploadService {
  constructor(private firebaseService: FirebaseService) {}

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    try {
      const bucket = this.firebaseService.getStorage().bucket();
      const ext = path.extname(file.originalname);
      const filename = `uploads/images/${uuidv4()}${ext}`;
      const fileUpload = bucket.file(filename);

      // Create a stream and pipe the buffer to Firebase Storage
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
        public: true, // Make it publicly readable
      });

      // Return the public URL
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
      return publicUrl;
    } catch (error) {
      console.error('Firebase Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
}
