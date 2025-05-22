# Firebase Integration for Toiral Web

This project is fully integrated with Firebase services, including Realtime Database, Firestore, Authentication, and Hosting.

## Firebase Configuration

The Firebase configuration is stored in `src/firebase/config.ts`. This file initializes the Firebase app and exports the necessary services:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAOV645LhBhyfwJHTj2S8PPP-srWCZ4BNk",
  authDomain: "web-toiral.firebaseapp.com",
  databaseURL: "https://web-toiral-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-toiral",
  storageBucket: "web-toiral.firebasestorage.app",
  messagingSenderId: "291312438179",
  appId: "1:291312438179:web:83f9d0669b2be4e0d0e816",
  measurementId: "G-P5GXME2GEM",
  site: "web-toiraldev"
};
```

## Firebase Realtime Database

The project uses Firebase Realtime Database for storing and retrieving data. The following sections are stored in the database:

- **Bookings**: Appointment bookings from users
- **Reviews**: User reviews
- **Contact Submissions**: Messages from the contact form
- **Chat Messages**: Messages from the live chat
- **Company Settings**: Company information and settings

### Database Utility Functions

The `src/firebase/contentDatabase.ts` file provides utility functions for interacting with the Realtime Database:

- **Bookings**
  - `addBooking`: Add a new booking
  - `getBookings`: Get all bookings
  - `updateBookingStatus`: Update the status of a booking
  - `subscribeToBookings`: Subscribe to changes in bookings

- **Reviews**
  - `addReview`: Add a new review
  - `getReviews`: Get all reviews
  - `updateReviewApproval`: Update the approval status of a review
  - `deleteReview`: Delete a review
  - `subscribeToReviews`: Subscribe to changes in reviews

- **Contact Submissions**
  - `addContactSubmission`: Add a new contact submission
  - `getContactSubmissions`: Get all contact submissions
  - `updateContactStatus`: Update the status of a contact submission
  - `deleteContactSubmission`: Delete a contact submission
  - `subscribeToContactSubmissions`: Subscribe to changes in contact submissions

- **Chat Messages**
  - `addChatMessage`: Add a new chat message
  - `getChatMessages`: Get all chat messages
  - `updateChatMessageStatus`: Update the status of a chat message
  - `subscribeToChatMessages`: Subscribe to changes in chat messages

- **Company Settings**
  - `updateCompanySettings`: Update company settings
  - `getCompanySettings`: Get company settings
  - `subscribeToCompanySettings`: Subscribe to changes in company settings

### Database Initialization

The `src/firebase/initializeDatabase.ts` file provides functions for initializing and resetting the database:

- `initializeDatabase`: Initialize the database with default data
- `resetDatabaseSection`: Reset a specific section of the database
- `resetEntireDatabase`: Reset the entire database to default values

## Firebase Authentication

The project includes Firebase Authentication for user authentication. The `FirebaseAuth` component demonstrates how to use Firebase Authentication for:

- User registration
- User login
- Password reset
- User profile display
- Logout functionality

## Firebase Hosting

The project is configured for deployment to Firebase Hosting. The configuration is stored in `firebase.json`:

```json
{
  "hosting": {
    "site": "web-toiraldev",
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "database": {
    "rules": "database.rules.json"
  }
}
```

### Deployment

To deploy the project to Firebase Hosting:

1. Build the project:
   ```
   npm run build
   ```

2. Deploy to Firebase Hosting:
   ```
   firebase deploy --only hosting
   ```

3. Your site will be available at: https://web-toiraldev.web.app

## Security Rules

The database security rules are stored in `database.rules.json`. For development, the rules allow read and write access to everyone:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, you should update the rules to restrict access:

```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## Firebase Components

The project includes several components for interacting with Firebase:

- **FirebaseExamples**: Demonstrates various features of the Realtime Database
- **FirebaseAuth**: Demonstrates Firebase Authentication
- **FirebaseDatabaseManager**: Provides a UI for managing the database
- **RealtimeDatabaseExample**: A simple example of using the Realtime Database

## Integration with Existing Components

The following components have been updated to use Firebase:

- **BookingForm**: Uses Firebase to store booking submissions
- **ReviewForm**: Uses Firebase to store review submissions
- **ContactForm**: Uses Firebase to store contact form submissions
- **ContentContext**: Uses Firebase for data storage and retrieval

## Getting Started

1. Initialize the database:
   - Open the Firebase Database Manager from the desktop
   - Click "Initialize Database" to set up the database with default data

2. Test the integration:
   - Submit a booking through the Appointments section
   - Submit a review through the Reviews section
   - Submit a contact form through the Contact section
   - Check the Firebase Database Manager to see the data

## Troubleshooting

If you encounter issues with the Firebase integration:

1. Check the browser console for errors
2. Verify that your Firebase project is properly configured
3. Make sure the security rules allow read and write access during development
4. Try resetting the database section that's causing issues using the Firebase Database Manager
