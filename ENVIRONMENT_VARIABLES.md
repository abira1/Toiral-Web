# Environment Variables Guide

This document explains how to use environment variables in the Toiral Web application to secure your Firebase configuration and other sensitive information.

## Available Environment Files

- `.env.example` - Template file with example values (do not use in production)
- `.env.development` - Used for local development
- `.env.production` - Used for production builds

## Environment Variables

### Firebase Configuration

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_DATABASE_URL=your_database_url_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id_here
VITE_FIREBASE_SITE=your_site_name_here
```

### Admin Configuration

```
VITE_ADMIN_EMAIL=admin_email@example.com
```

### FCM Configuration

```
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### Analytics Configuration

```
VITE_GOOGLE_ANALYTICS_ID=your_analytics_id_here
```

## Local Development

1. Copy `.env.example` to `.env.development`
2. Fill in your development environment values
3. Run `npm run dev` to start the development server

## Production Deployment

### Option 1: Using Environment Files

1. Copy `.env.example` to `.env.production`
2. Fill in your production environment values
3. Run `set-env-vars.bat` to set the environment variables
4. Run `deploy-to-firebase.bat` to build and deploy

### Option 2: Setting Environment Variables in Firebase

You can also set environment variables directly in Firebase:

```bash
firebase functions:config:set firebase.apikey="your_api_key" firebase.authdomain="your_auth_domain" ...
```

## Firebase Service Worker

The Firebase messaging service worker (`firebase-messaging-sw.js`) is automatically generated during the build process using the environment variables. You don't need to manually edit this file.

## Security Notes

- Never commit your `.env.development` or `.env.production` files to version control
- The `.env.example` file should only contain placeholder values, not real credentials
- For additional security, consider using Firebase Functions to handle sensitive operations

## Troubleshooting

If you encounter issues with environment variables:

1. Make sure you've set all required variables in your `.env` files
2. Run `npm run generate-sw` to regenerate the Firebase service worker
3. Check that the variables are being correctly loaded in the Vite configuration
4. For Windows users, ensure you run `set-env-vars.bat` before deployment
