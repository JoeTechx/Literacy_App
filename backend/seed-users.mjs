import { initializeApp } from 'firebase-admin/app';
import { cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as bcrypt from 'bcryptjs';
import fs from 'fs';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Load .env manually for standalone script
const envConfig = fs.readFileSync('./.env', 'utf8').split('\n');
const envVars = {};
envConfig.forEach(line => {
  const match = line.match(/^([^=:#]+?)[=:](.*)/);
  if (match) envVars[match[1].trim()] = match[2].trim();
});

// Initialize Firebase Admin directly
const serviceAccount = JSON.parse(fs.readFileSync('./firebase-key.json', 'utf8'));
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const transporter = nodemailer.createTransport({
  host: envVars['SMTP_HOST'] || 'smtp.gmail.com',
  port: Number(envVars['SMTP_PORT']) || 465,
  secure: true,
  auth: {
    user: envVars['SMTP_USER'],
    pass: envVars['SMTP_PASS'],
  },
});

async function seedUser(name, email, password, role) {
  try {
    const usersRef = db.collection('users');
    const existing = await usersRef.where('email', '==', email).limit(1).get();

    if (!existing.empty) {
      console.log(`⚠️ User with email ${email} already exists.`);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isStaff = role !== 'student';
    const token = isStaff ? crypto.randomBytes(32).toString('hex') : null;

    const userDoc = {
      name,
      email,
      password: hashedPassword,
      role,
      totalPoints: 0,
      avatar: null,
      age: null,
      teacherId: null,
      isVerified: !isStaff,
      verificationToken: token,
      createdAt: new Date().toISOString(),
    };

    const docRef = await usersRef.add(userDoc);
    console.log(`✅ ${role.toUpperCase()} created successfully! ID: ${docRef.id}`);

    if (isStaff && token && envVars['SMTP_USER']) {
      const verifyUrl = `http://localhost:3000/api/v1/auth/verify?token=${token}`;
      await transporter.sendMail({
        from: `"Literacy App" <${envVars['SMTP_USER']}>`,
        to: email,
        subject: 'Verify your Literacy App account',
        html: `<p>Welcome ${name},</p><p>Please verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`,
      });
      console.log(`📧 Verification email sent to ${email}`);
    }

  } catch (error) {
    console.error(`❌ Failed to create ${role}:`, error);
  }
}

async function run() {
  console.log('Seeding initial users...');

  // Create the foundational SUPERADMIN
  await seedUser('Oyinloye Joseph', 'graphicjsquare@gmail.com', 'oyinjoe23', 'superadmin');

  console.log('Finished seeding.');
  process.exit(0);
}

run();
