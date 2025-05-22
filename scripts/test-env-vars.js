// This script tests that environment variables are loaded correctly
import dotenv from 'dotenv';

// Load environment variables based on NODE_ENV
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = `.env.${NODE_ENV}`;

console.log(`Loading environment variables from: ${envFile}`);
dotenv.config({ path: envFile });

// Check if required environment variables are set
const requiredVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_FIREBASE_SITE',
  'VITE_ADMIN_EMAIL',
  'VITE_FIREBASE_VAPID_KEY',
  'VITE_GOOGLE_ANALYTICS_ID',
  'VITE_APP_ENV'
];

// Check each variable
const missingVars = [];
const presentVars = [];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    missingVars.push(varName);
  } else {
    // Show first few characters of the value for verification
    const value = process.env[varName];
    const maskedValue = value.substring(0, 4) + '...' + value.substring(value.length - 4);
    presentVars.push(`${varName}: ${maskedValue}`);
  }
}

// Print results
console.log('\nEnvironment Variables Test Results:');
console.log('===================================');

if (missingVars.length > 0) {
  console.log('\n❌ Missing environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
} else {
  console.log('\n✅ All required environment variables are set!');
}

console.log('\nPresent environment variables (masked):');
presentVars.forEach(varInfo => console.log(`   - ${varInfo}`));

console.log('\n===================================');

// Exit with error code if any variables are missing
if (missingVars.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
