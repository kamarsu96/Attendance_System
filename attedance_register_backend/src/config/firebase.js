const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
try {
  // IMPORTANT: The user must provide this file in the backend root directory.
  const serviceAccountPath = path.join(__dirname, '../../firebase-service-account.json');
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin initialized successfully.');
} catch (error) {
  console.warn('Firebase Admin is not fully initialized. Please ensure "firebase-service-account.json" is placed in the project root directory.');
}

module.exports = admin;
