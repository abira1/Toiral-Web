/**
 * Validation service for client-side data validation
 * Provides functions to validate different types of data
 */

// Email validation
export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  // Basic email regex pattern
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  
  if (!email) {
    return { valid: false, message: 'Email is required' };
  }
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  
  // Check for common disposable email domains
  const disposableDomains = [
    'mailinator.com', 'tempmail.com', 'throwawaymail.com', 
    'guerrillamail.com', 'yopmail.com', 'temp-mail.org'
  ];
  
  const domain = email.split('@')[1].toLowerCase();
  
  if (disposableDomains.includes(domain)) {
    return { valid: false, message: 'Please use a non-disposable email address' };
  }
  
  return { valid: true };
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; message?: string; strength?: 'weak' | 'medium' | 'strong' } => {
  if (!password) {
    return { valid: false, message: 'Password is required', strength: 'weak' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long', strength: 'weak' };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const noConsecutiveChars = !/(.)\1{2,}/.test(password);
  const noCommonPatterns = !/^(password|admin|123|qwerty)/i.test(password);
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let failedChecks = [];
  
  if (!hasUppercase) {
    failedChecks.push('an uppercase letter');
  }
  
  if (!hasLowercase) {
    failedChecks.push('a lowercase letter');
  }
  
  if (!hasNumber) {
    failedChecks.push('a number');
  }
  
  if (!hasSpecialChar) {
    failedChecks.push('a special character');
  }
  
  if (!noConsecutiveChars) {
    failedChecks.push('no more than 2 consecutive identical characters');
  }
  
  if (!noCommonPatterns) {
    failedChecks.push('no common patterns like "password", "admin", "123", or "qwerty"');
  }
  
  // Calculate password strength
  let strengthScore = 0;
  if (password.length >= 8) strengthScore++;
  if (password.length >= 12) strengthScore++;
  if (hasUppercase) strengthScore++;
  if (hasLowercase) strengthScore++;
  if (hasNumber) strengthScore++;
  if (hasSpecialChar) strengthScore++;
  if (noConsecutiveChars) strengthScore++;
  if (noCommonPatterns) strengthScore++;
  
  if (strengthScore >= 7) {
    strength = 'strong';
  } else if (strengthScore >= 4) {
    strength = 'medium';
  }
  
  if (failedChecks.length > 0) {
    return { 
      valid: false, 
      message: `Password must include ${failedChecks.join(', ')}`,
      strength
    };
  }
  
  return { valid: true, strength };
};

// Phone number validation
export const validatePhoneNumber = (phoneNumber: string): { valid: boolean; message?: string } => {
  if (!phoneNumber) {
    return { valid: false, message: 'Phone number is required' };
  }
  
  // Remove spaces, dashes, and parentheses
  const cleanedNumber = phoneNumber.replace(/[\s\-()]/g, '');
  
  // Check if the number contains only digits and optional + at the beginning
  if (!/^\+?\d{10,15}$/.test(cleanedNumber)) {
    return { valid: false, message: 'Please enter a valid phone number' };
  }
  
  return { valid: true };
};

// Name validation
export const validateName = (name: string): { valid: boolean; message?: string } => {
  if (!name) {
    return { valid: false, message: 'Name is required' };
  }
  
  if (name.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters long' };
  }
  
  if (name.length > 100) {
    return { valid: false, message: 'Name must be less than 100 characters long' };
  }
  
  // Check for special characters that shouldn't be in names
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(name)) {
    return { valid: false, message: 'Name contains invalid characters' };
  }
  
  return { valid: true };
};

// URL validation
export const validateUrl = (url: string): { valid: boolean; message?: string } => {
  if (!url) {
    return { valid: false, message: 'URL is required' };
  }
  
  try {
    const parsedUrl = new URL(url);
    
    // Check if protocol is http or https
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { valid: false, message: 'URL must use http or https protocol' };
    }
    
    return { valid: true };
  } catch (error) {
    return { valid: false, message: 'Please enter a valid URL' };
  }
};

// Date validation
export const validateDate = (date: string): { valid: boolean; message?: string } => {
  if (!date) {
    return { valid: false, message: 'Date is required' };
  }
  
  // Check if date is in ISO format
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z)?$/.test(date)) {
    return { valid: false, message: 'Invalid date format' };
  }
  
  const parsedDate = new Date(date);
  
  // Check if date is valid
  if (isNaN(parsedDate.getTime())) {
    return { valid: false, message: 'Invalid date' };
  }
  
  // Check if date is not in the past
  const now = new Date();
  if (parsedDate < now) {
    return { valid: false, message: 'Date cannot be in the past' };
  }
  
  return { valid: true };
};

// Text content validation (for reviews, comments, etc.)
export const validateTextContent = (text: string, maxLength: number = 2000): { valid: boolean; message?: string } => {
  if (!text) {
    return { valid: false, message: 'Text is required' };
  }
  
  if (text.length > maxLength) {
    return { valid: false, message: `Text must be less than ${maxLength} characters long` };
  }
  
  // Check for potentially malicious content
  const suspiciousPatterns = [
    /<script/i, // Script tags
    /javascript:/i, // JavaScript protocol
    /on\w+=/i, // Event handlers
    /data:/i, // Data URLs
    /document\./i, // DOM manipulation
    /eval\(/i, // Eval function
    /alert\(/i, // Alert function
    /confirm\(/i, // Confirm function
    /prompt\(/i, // Prompt function
    /fetch\(/i, // Fetch API
    /XMLHttpRequest/i // XHR
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return { valid: false, message: 'Text contains potentially malicious content' };
    }
  }
  
  return { valid: true };
};

// Form data validation
export const validateFormData = (data: any, schema: any): { valid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};
  let valid = true;
  
  // Validate each field according to the schema
  for (const field in schema) {
    if (schema[field].required && !data[field]) {
      errors[field] = `${schema[field].label || field} is required`;
      valid = false;
      continue;
    }
    
    if (!data[field] && !schema[field].required) {
      continue;
    }
    
    // Validate field based on type
    switch (schema[field].type) {
      case 'email':
        const emailResult = validateEmail(data[field]);
        if (!emailResult.valid) {
          errors[field] = emailResult.message || `Invalid email`;
          valid = false;
        }
        break;
      case 'password':
        const passwordResult = validatePassword(data[field]);
        if (!passwordResult.valid) {
          errors[field] = passwordResult.message || `Invalid password`;
          valid = false;
        }
        break;
      case 'phone':
        const phoneResult = validatePhoneNumber(data[field]);
        if (!phoneResult.valid) {
          errors[field] = phoneResult.message || `Invalid phone number`;
          valid = false;
        }
        break;
      case 'url':
        const urlResult = validateUrl(data[field]);
        if (!urlResult.valid) {
          errors[field] = urlResult.message || `Invalid URL`;
          valid = false;
        }
        break;
      case 'date':
        const dateResult = validateDate(data[field]);
        if (!dateResult.valid) {
          errors[field] = dateResult.message || `Invalid date`;
          valid = false;
        }
        break;
      case 'text':
        const textResult = validateTextContent(data[field], schema[field].maxLength);
        if (!textResult.valid) {
          errors[field] = textResult.message || `Invalid text`;
          valid = false;
        }
        break;
      default:
        // No specific validation for other types
        break;
    }
  }
  
  return { valid, errors };
};
