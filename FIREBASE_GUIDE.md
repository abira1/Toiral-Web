# Firebase Integration Guide

This project is fully integrated with Firebase services, including Realtime Database and Firebase Hosting.

## Firebase Configuration

The Firebase configuration is stored in `src/firebase/config.ts`. This file initializes the Firebase app and exports the necessary services:

- Firebase App
- Firestore Database
- Authentication
- Realtime Database
- Analytics

## Firebase Realtime Database

### Database Utility Functions

The `src/firebase/database.ts` file provides utility functions for interacting with the Realtime Database:

- `writeData(path, data)`: Write data to a specific path
- `pushData(path, data)`: Generate a new unique key and write data
- `readData(path)`: Read data from a specific path
- `updateData(path, updates)`: Update specific fields at a path
- `deleteData(path)`: Delete data at a specific path
- `subscribeToData(path, callback)`: Subscribe to data changes at a specific path
- `queryByChild(path, child, value)`: Query data by a specific child value

### Example Components

The project includes two example components that demonstrate how to use the Realtime Database:

1. **RealtimeDatabaseExample**: A simple example that shows how to add, read, and delete messages.
2. **FirebaseExamples**: A more comprehensive example that demonstrates various features of the Realtime Database, including:
   - Messages management
   - User management
   - Product management
   - Real-time data synchronization

## Firebase Hosting

### Configuration

The Firebase Hosting configuration is stored in `firebase.json`. This file specifies:

- The site name: `web-toiraldev`
- The public directory: `dist` (Vite's default output directory)
- Rewrite rules to support single-page applications
- Database rules location

### Security Rules

The database security rules are stored in `database.rules.json`. The current rules allow read and write access to everyone, which is suitable for development but should be changed for production.

For production, you should update the rules to restrict access:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Deployment

### Prerequisites

1. Make sure you're logged in to Firebase:
   ```
   firebase login
   ```

2. Ensure you have the correct project selected:
   ```
   firebase use web-toiral
   ```

### Deployment Options

#### Option 1: Using the Deployment Script

Run the deployment script:

```
deploy-to-firebase.bat
```

This script will:
1. Build the project
2. Deploy to Firebase Hosting

#### Option 2: Manual Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```
   firebase deploy --only hosting
   ```

3. To deploy only the database rules:
   ```
   firebase deploy --only database
   ```

4. To deploy everything:
   ```
   firebase deploy
   ```

### Accessing Your Deployed Site

After deployment, your site will be available at:

- https://web-toiraldev.web.app
- https://web-toiraldev.firebaseapp.com

## Local Development

### Running the Development Server

```
npm run dev
```

### Testing Firebase Hosting Configuration Locally

```
firebase serve
```

This will start a local server, typically at http://localhost:5000

## Important Security Notes

1. For production, update the database security rules to restrict access
2. Consider using Firebase Authentication to secure your data
3. Never expose sensitive API keys or credentials in client-side code

## Firebase Console

You can manage your Firebase project at: https://console.firebase.google.com/project/web-toiral

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Security Rules](https://firebase.google.com/docs/database/security)
