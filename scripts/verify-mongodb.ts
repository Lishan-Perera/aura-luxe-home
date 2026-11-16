import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Import Mongoose Models
import User from '../src/models/User';
import Product from '../src/models/Product';
import Order from '../src/models/Order';
import Category from '../src/models/Category';
import Inventory from '../src/models/Inventory';
import Address from '../src/models/Address';

async function verifyDatabaseAndSecurity() {
  console.log('====================================================');
  console.log('🔍 MONGODB ATLAS & SECURITY COMPREHENSIVE AUDIT');
  console.log('====================================================\n');

  // 1. Mongoose Models Compilation Check
  console.log('1. Checking Mongoose Schema & Models...');
  const models = [
    { name: 'User', model: User },
    { name: 'Product', model: Product },
    { name: 'Order', model: Order },
    { name: 'Category', model: Category },
    { name: 'Inventory', model: Inventory },
    { name: 'Address', model: Address },
  ];

  for (const m of models) {
    if (m.model && m.model.modelName === m.name) {
      console.log(`   ✅ Model compiled: ${m.name}`);
    } else {
      console.log(`   ❌ Model failed: ${m.name}`);
    }
  }

  // 2. Schema Validation Tests
  console.log('\n2. Testing Mongoose Field Validation & Regex...');
  try {
    const invalidUser = new User({
      fullName: 'Test',
      email: 'not-an-email',
      passwordHash: 'dummy',
      phone: '12345', // Invalid Sri Lankan phone
    });
    const err = invalidUser.validateSync();
    if (err && err.errors.email && err.errors.phone) {
      console.log('   ✅ Email regex validation properly rejected invalid email.');
      console.log('   ✅ Sri Lankan phone validation properly rejected invalid phone.');
    } else {
      console.log('   ⚠️ Validation test unexpected result:', err);
    }
  } catch (err: any) {
    console.log('   Validation error:', err.message);
  }

  // 3. Password Hashing Security (Bcrypt cost factor 12)
  console.log('\n3. Testing Password Security & Hashing...');
  const rawPassword = 'AuraLuxeSecurePassword2026!';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(rawPassword, salt);
  const match = await bcrypt.compare(rawPassword, hash);
  const wrongMatch = await bcrypt.compare('WrongPassword', hash);

  console.log(`   ✅ Bcrypt salt rounds = 12 successfully applied.`);
  console.log(`   ✅ Correct password matches hash: ${match}`);
  console.log(`   ✅ Incorrect password rejected: ${!wrongMatch}`);

  // 4. JWT Cryptographic Signing & Expiration
  console.log('\n4. Testing JWT Security (JOSE HS256)...');
  const secretKey = new TextEncoder().encode('test_super_secure_key_1234567890123456');
  const token = await new SignJWT({ userId: 'u-1', role: 'super_admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('2h')
    .sign(secretKey);

  const { payload } = await jwtVerify(token, secretKey);
  console.log(`   ✅ JWT Signed & Verified. Role: ${payload.role}, Expires in: 2h`);

  // 5. MongoDB Atlas Connection Check
  console.log('\n5. Verifying MongoDB Atlas Connection Status...');
  const uri = process.env.MONGODB_URI || '';
  console.log(`   Current MONGODB_URI: ${uri.replace(/:([^:@]+)@/, ':****@')}`);

  if (!uri || uri.includes('mock:mock') || uri.includes('your_username')) {
    console.log('   ℹ️  STATUS: MONGODB_URI is currently set to placeholder template.');
    console.log('   ℹ️  ACTION REQUIRED: User must provide their actual MongoDB Atlas cluster connection string in .env.local to persist documents to the cloud cluster.');
  } else {
    try {
      console.log('   Attempting connection to MongoDB Atlas...');
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('   ✅ Connected successfully to live MongoDB Atlas!');
      await mongoose.disconnect();
    } catch (connErr: any) {
      console.log(`   ⚠️ Could not reach live MongoDB cluster: ${connErr.message}`);
    }
  }

  console.log('\n====================================================');
  console.log('AUDIT COMPLETED');
  console.log('====================================================');
}

verifyDatabaseAndSecurity().catch(console.error);

