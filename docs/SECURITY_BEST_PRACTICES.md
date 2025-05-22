# Toiral Web Application Security Best Practices

This document outlines security best practices for the Toiral web application development team.

## Firebase Security

### Realtime Database Security Rules

1. **Default Deny**: Always start with default deny rules and explicitly grant access.
   ```json
   {
     "rules": {
       ".read": false,
       ".write": false,
       // Specific rules follow...
     }
   }
   ```

2. **Data Validation**: Always validate data structure and content.
   ```json
   "$reviewId": {
     ".validate": "newData.hasChildren(['id', 'name', 'rating', 'text', 'timestamp'])",
     "rating": {
       ".validate": "newData.isNumber() && newData.val() >= 1 && newData.val() <= 5"
     }
   }
   ```

3. **User Authentication**: Always check authentication for sensitive operations.
   ```json
   ".write": "auth != null && auth.uid === $userId"
   ```

4. **Role-Based Access**: Use role-based permissions for administrative functions.
   ```json
   ".write": "auth != null && root.child('profile').child(auth.uid).child('role').val() === 'admin'"
   ```

5. **Data Ownership**: Ensure users can only modify their own data.
   ```json
   "$bookingId": {
     ".read": "auth != null && data.child('userId').val() === auth.uid"
   }
   ```

6. **Indexing**: Add indexes for frequently queried paths.
   ```json
   "users": {
     ".indexOn": ["email", "createdAt"]
   }
   ```

### Authentication

1. **Strong Password Policy**: Enforce strong password requirements.
   ```typescript
   const PASSWORD_REQUIREMENTS = {
     minLength: 8,
     requireNumbers: true,
     requireSpecialChars: true,
     requireUppercase: true,
     requireLowercase: true
   };
   ```

2. **Account Lockout**: Implement account lockout after multiple failed attempts.
   ```typescript
   if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
     lockAccount(userId, LOCKOUT_DURATION);
   }
   ```

3. **Secure Session Management**: Use secure, HttpOnly cookies with proper expiration.

4. **Multi-Factor Authentication**: Offer MFA for sensitive operations.

5. **Secure Password Reset**: Implement secure password reset flows with expiring tokens.

## Data Protection

### Encryption

1. **Client-Side Encryption**: Encrypt sensitive data before storing.
   ```typescript
   const encryptedData = CryptoJS.AES.encrypt(sensitiveData, ENCRYPTION_KEY).toString();
   ```

2. **Environment Variables**: Store encryption keys in environment variables.
   ```typescript
   const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY;
   ```

3. **Data Minimization**: Only collect and store necessary data.

### Input Validation

1. **Client-Side Validation**: Validate all user inputs on the client.
   ```typescript
   const validateEmail = (email: string): boolean => {
     return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
   };
   ```

2. **Server-Side Validation**: Always validate data on the server regardless of client validation.

3. **Content Sanitization**: Sanitize user-generated content to prevent XSS.
   ```typescript
   const sanitizedContent = DOMPurify.sanitize(userContent);
   ```

## Access Control

1. **Principle of Least Privilege**: Grant only the permissions necessary for the task.

2. **Permission Checks**: Always check permissions before performing sensitive operations.
   ```typescript
   if (!hasPermission('canManageUsers')) {
     return <Navigate to="/unauthorized" />;
   }
   ```

3. **Role Separation**: Implement clear separation between user roles.

4. **Protected Routes**: Use protected routes for authenticated content.
   ```tsx
   <Route
     path="/admin"
     element={
       <ProtectedRoute requireAdmin={true}>
         <AdminDashboard />
       </ProtectedRoute>
     }
   />
   ```

## Security Monitoring

1. **Logging**: Log all security-relevant events.
   ```typescript
   await recordSecurityEvent('loginAttempt', {
     userId,
     success: true,
     ipAddress,
     timestamp: new Date().toISOString()
   });
   ```

2. **Anomaly Detection**: Monitor for suspicious activity patterns.

3. **Rate Limiting**: Implement rate limiting for all public endpoints.
   ```typescript
   const isRateLimited = await checkRateLimit(userId, 'login', 5, 300000);
   if (isRateLimited) {
     return { success: false, error: 'Too many login attempts' };
   }
   ```

4. **Alerting**: Set up alerts for security incidents.

## Secure Development

1. **Dependency Management**: Keep all dependencies up to date.
   ```bash
   npm audit fix
   ```

2. **Code Reviews**: Conduct security-focused code reviews.

3. **Static Analysis**: Use static code analysis tools to identify vulnerabilities.

4. **Secure Defaults**: Always use secure defaults for all configurations.

5. **Error Handling**: Implement proper error handling to avoid information leakage.
   ```typescript
   try {
     // Operation
   } catch (error) {
     console.error('Internal error:', error);
     return { success: false, error: 'An error occurred' }; // Don't expose details
   }
   ```

## API Security

1. **HTTPS**: Always use HTTPS for all communications.

2. **API Authentication**: Properly authenticate all API requests.

3. **CORS**: Configure CORS to restrict access to trusted domains.

4. **Request Validation**: Validate all API request parameters.

## Frontend Security

1. **Content Security Policy**: Implement CSP to prevent XSS attacks.
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
   ```

2. **Subresource Integrity**: Use SRI for external resources.
   ```html
   <script src="https://example.com/script.js" 
           integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
           crossorigin="anonymous"></script>
   ```

3. **Secure Cookies**: Use secure and HttpOnly flags for cookies.

4. **XSS Prevention**: Avoid using `dangerouslySetInnerHTML` and sanitize user content.

5. **CSRF Protection**: Implement CSRF tokens for state-changing operations.

## Security Testing

1. **Penetration Testing**: Conduct regular penetration testing.

2. **Vulnerability Scanning**: Use automated tools to scan for vulnerabilities.

3. **Security Reviews**: Perform regular security reviews of the application.

4. **Threat Modeling**: Identify potential threats and mitigations.

## Incident Response

1. **Response Plan**: Have a documented security incident response plan.

2. **Contact Information**: Maintain up-to-date security contact information.

3. **Disclosure Policy**: Establish a responsible disclosure policy.

4. **Recovery Procedures**: Document recovery procedures for security incidents.

## Compliance

1. **Data Protection**: Comply with relevant data protection regulations (GDPR, CCPA, etc.).

2. **Privacy Policy**: Maintain an up-to-date privacy policy.

3. **Terms of Service**: Clearly document terms of service.

4. **Cookie Consent**: Implement cookie consent mechanisms where required.

## Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Best Practices](https://web.dev/secure/)
- [React Security Best Practices](https://reactjs.org/docs/security.html)
- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [CryptoJS Documentation](https://cryptojs.gitbook.io/docs/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [GDPR Compliance](https://gdpr.eu/)
