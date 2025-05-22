# Firebase Setup Instructions

This project is configured to use Firebase Realtime Database and Firebase Hosting.

## Firebase Realtime Database

The Firebase Realtime Database is already set up in this project. You can use the database functions in `src/firebase/database.ts` to interact with the database.

### Security Rules

The current security rules in `database.rules.json` are set to allow read and write access to everyone. This is suitable for development but should be changed for production.

To update the security rules:

1. Edit the `database.rules.json` file
2. Deploy the rules using: `firebase deploy --only database`

## Firebase Hosting

To deploy this project to Firebase Hosting:

1. Make sure you're logged in to Firebase:
   ```
   firebase login
   ```

2. Build the project:
   ```
   npm run build
   ```

3. Deploy to Firebase Hosting:
   ```
   firebase deploy --only hosting
   ```

4. Your site will be available at: https://web-toiraldev.web.app

## Complete Deployment

To deploy both database rules and hosting:

```
firebase deploy
```

## Testing Locally

To test your Firebase hosting configuration locally:

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
