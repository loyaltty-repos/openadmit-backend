import admin from 'firebase-admin';
import path from 'path';

// Test Firebase connection
const testFirebase = async () => {
    try {
        console.log('Testing Firebase connection...');
        
        const serviceAccountPath = path.resolve('./firebase-service-account.json');
        console.log('Service account path:', serviceAccountPath);
        
        // Read and parse service account
        const serviceAccount = JSON.parse(await import('fs').then(fs => fs.promises.readFile(serviceAccountPath, 'utf8')));
        console.log('Project ID from service account:', serviceAccount.project_id);
        
        // Initialize Firebase
        const app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
        
        console.log('Firebase app initialized successfully');
        
        // Test Firestore connection
        const db = admin.firestore();
        console.log('Firestore instance created');
        
        // Try to write a test document
        const testRef = db.collection('test').doc('connection-test');
        await testRef.set({
            timestamp: new Date(),
            message: 'Connection test successful'
        });
        
        console.log('✅ Firebase connection test PASSED - Firestore write successful');
        
        // Clean up test document
        await testRef.delete();
        console.log('Test document cleaned up');
        
    } catch (error) {
        console.error('❌ Firebase connection test FAILED:', error);
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        
        if (error.code === 5) {
            console.error('\n🔍 Troubleshooting suggestions for error code 5 (NOT_FOUND):');
            console.error('1. Verify the project ID "petsu-1b1fa" exists in Firebase Console');
            console.error('2. Check if Firestore Database is created (not just Realtime Database)');
            console.error('3. Ensure the service account has proper permissions');
            console.error('4. Verify you are using the correct Firebase project');
        }
    }
};

testFirebase().then(() => {
    process.exit(0);
}).catch(err => {
    console.error('Test script error:', err);
    process.exit(1);
});