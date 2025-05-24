/**
 * Database Validation Service
 *
 * This service provides comprehensive validation for all data operations
 * before they are sent to Firebase Realtime Database. It ensures data
 * integrity and security while maintaining backward compatibility.
 *
 * IMPORTANT: This service is designed to be non-breaking. It validates
 * data but allows operations to proceed if validation is disabled or
 * if there are any errors in the validation process itself.
 */

import {
  DataSchema,
  FieldSchema,
  getSchema,
  schemaRegistry
} from './dataSchemas';
import {
  validateEmail,
  validatePhoneNumber,
  validateName,
  validateUrl
} from './validationService';

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: { [field: string]: string };
  warnings: { [field: string]: string };
  sanitizedData?: any;
}

// Validation options
export interface ValidationOptions {
  strict: boolean; // If true, validation errors will prevent operations
  sanitize: boolean; // If true, data will be sanitized
  allowExtraFields: boolean; // If true, extra fields not in schema are allowed
  skipValidation: boolean; // If true, validation is completely skipped
}

// Default validation options (non-breaking)
const defaultValidationOptions: ValidationOptions = {
  strict: false, // Non-breaking by default
  sanitize: true,
  allowExtraFields: true, // Allow extra fields for backward compatibility
  skipValidation: false
};

/**
 * Validates a single field against its schema
 */
const validateField = (
  value: any,
  fieldSchema: FieldSchema,
  fieldName: string
): { valid: boolean; error?: string; warning?: string; sanitizedValue?: any } => {
  try {
    let sanitizedValue = value;

    // Handle null/undefined values
    if (value === null || value === undefined) {
      if (fieldSchema.required) {
        return {
          valid: false,
          error: `${fieldSchema.label || fieldName} is required`
        };
      }
      return { valid: true, sanitizedValue: value };
    }

    // Type validation and sanitization
    switch (fieldSchema.type) {
      case 'string':
        if (typeof value !== 'string') {
          sanitizedValue = String(value);
        }

        // Length validation
        if (fieldSchema.minLength && sanitizedValue.length < fieldSchema.minLength) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} must be at least ${fieldSchema.minLength} characters`
          };
        }
        if (fieldSchema.maxLength && sanitizedValue.length > fieldSchema.maxLength) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} must be less than ${fieldSchema.maxLength} characters`
          };
        }

        // Pattern validation
        if (fieldSchema.pattern && !fieldSchema.pattern.test(sanitizedValue)) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} format is invalid`
          };
        }
        break;

      case 'number':
        if (typeof value !== 'number') {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            return {
              valid: false,
              error: `${fieldSchema.label || fieldName} must be a number`
            };
          }
          sanitizedValue = numValue;
        }

        // Range validation
        if (fieldSchema.min !== undefined && sanitizedValue < fieldSchema.min) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} must be at least ${fieldSchema.min}`
          };
        }
        if (fieldSchema.max !== undefined && sanitizedValue > fieldSchema.max) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} must be at most ${fieldSchema.max}`
          };
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          // Convert common boolean representations
          if (value === 'true' || value === 1 || value === '1') {
            sanitizedValue = true;
          } else if (value === 'false' || value === 0 || value === '0') {
            sanitizedValue = false;
          } else {
            return {
              valid: false,
              error: `${fieldSchema.label || fieldName} must be a boolean`
            };
          }
        }
        break;

      case 'email':
        const emailValidation = validateEmail(String(value));
        if (!emailValidation.valid) {
          return {
            valid: false,
            error: emailValidation.message
          };
        }
        sanitizedValue = String(value).toLowerCase().trim();
        break;

      case 'phone':
        const phoneValidation = validatePhoneNumber(String(value));
        if (!phoneValidation.valid) {
          return {
            valid: false,
            error: phoneValidation.message
          };
        }
        sanitizedValue = String(value).trim();
        break;

      case 'url':
        const urlValidation = validateUrl(String(value));
        if (!urlValidation.valid) {
          return {
            valid: false,
            error: urlValidation.message
          };
        }
        sanitizedValue = String(value).trim();
        break;

      case 'date':
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} must be a valid date`
          };
        }
        sanitizedValue = dateValue.toISOString();
        break;

      case 'enum':
        if (!fieldSchema.enumValues || !fieldSchema.enumValues.includes(value)) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} must be one of: ${fieldSchema.enumValues?.join(', ')}`
          };
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} must be an array`
          };
        }

        // Validate array items if schema is provided
        if (fieldSchema.arrayItemSchema) {
          const sanitizedArray = [];
          for (let i = 0; i < value.length; i++) {
            const itemValidation = validateField(
              value[i],
              fieldSchema.arrayItemSchema,
              `${fieldName}[${i}]`
            );
            if (!itemValidation.valid) {
              return {
                valid: false,
                error: itemValidation.error
              };
            }
            sanitizedArray.push(itemValidation.sanitizedValue);
          }
          sanitizedValue = sanitizedArray;
        }
        break;

      case 'object':
        if (typeof value !== 'object' || value === null) {
          return {
            valid: false,
            error: `${fieldSchema.label || fieldName} must be an object`
          };
        }

        // Validate object properties if schema is provided
        if (fieldSchema.objectSchema) {
          const sanitizedObject: any = {};
          for (const [key, propSchema] of Object.entries(fieldSchema.objectSchema)) {
            const propValidation = validateField(
              value[key],
              propSchema,
              `${fieldName}.${key}`
            );
            if (!propValidation.valid) {
              return {
                valid: false,
                error: propValidation.error
              };
            }
            sanitizedObject[key] = propValidation.sanitizedValue;
          }
          sanitizedValue = sanitizedObject;
        }
        break;
    }

    return { valid: true, sanitizedValue };
  } catch (error) {
    console.error(`Error validating field ${fieldName}:`, error);
    // In case of validation error, allow the operation to proceed
    return {
      valid: true,
      warning: `Validation error for ${fieldName}, proceeding without validation`,
      sanitizedValue: value
    };
  }
};

/**
 * Validates data against a schema
 */
export const validateData = (
  data: any,
  schema: DataSchema,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  const opts = { ...defaultValidationOptions, ...options };

  // Skip validation if requested
  if (opts.skipValidation) {
    return {
      valid: true,
      errors: {},
      warnings: {},
      sanitizedData: data
    };
  }

  try {
    const errors: { [field: string]: string } = {};
    const warnings: { [field: string]: string } = {};
    const sanitizedData: any = opts.sanitize ? {} : data;

    // Validate each field in the schema
    for (const [fieldName, fieldSchema] of Object.entries(schema)) {
      const fieldValidation = validateField(data[fieldName], fieldSchema, fieldName);

      if (!fieldValidation.valid && fieldValidation.error) {
        errors[fieldName] = fieldValidation.error;
      }

      if (fieldValidation.warning) {
        warnings[fieldName] = fieldValidation.warning;
      }

      if (opts.sanitize && fieldValidation.sanitizedValue !== undefined) {
        sanitizedData[fieldName] = fieldValidation.sanitizedValue;
      }
    }

    // Handle extra fields
    if (opts.allowExtraFields && opts.sanitize) {
      for (const [key, value] of Object.entries(data)) {
        if (!schema[key]) {
          sanitizedData[key] = value;
        }
      }
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      valid: isValid,
      errors,
      warnings,
      sanitizedData: opts.sanitize ? sanitizedData : data
    };
  } catch (error) {
    console.error('Error in data validation:', error);
    // In case of validation system error, allow operation to proceed
    return {
      valid: true,
      errors: {},
      warnings: { system: 'Validation system error, proceeding without validation' },
      sanitizedData: data
    };
  }
};

/**
 * Validates data by data type using the schema registry
 */
export const validateByDataType = (
  data: any,
  dataType: string,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  const schema = getSchema(dataType);

  if (!schema) {
    console.warn(`No schema found for data type: ${dataType}`);
    return {
      valid: true,
      errors: {},
      warnings: { schema: `No schema found for data type: ${dataType}` },
      sanitizedData: data
    };
  }

  return validateData(data, schema, options);
};

/**
 * Validates portfolio item data
 */
export const validatePortfolioItem = (
  data: any,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  return validateByDataType(data, 'portfolioItem', options);
};

/**
 * Validates review data
 */
export const validateReview = (
  data: any,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  return validateByDataType(data, 'review', options);
};

/**
 * Validates booking submission data
 */
export const validateBookingSubmission = (
  data: any,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  return validateByDataType(data, 'bookingSubmission', options);
};

/**
 * Validates contact form submission data
 */
export const validateContactFormSubmission = (
  data: any,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  return validateByDataType(data, 'contactFormSubmission', options);
};

/**
 * Validates user profile data
 */
export const validateUserProfile = (
  data: any,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  return validateByDataType(data, 'userProfile', options);
};

/**
 * Validates team member data
 */
export const validateTeamMember = (
  data: any,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  return validateByDataType(data, 'teamMember', options);
};

/**
 * Validates company profile data
 */
export const validateCompanyProfile = (
  data: any,
  options: Partial<ValidationOptions> = {}
): ValidationResult => {
  return validateByDataType(data, 'companyProfile', options);
};

/**
 * Main validation middleware function
 * This function can be used to wrap any database operation
 */
export const validateBeforeOperation = async (
  data: any,
  dataType: string,
  operation: 'create' | 'update' | 'delete',
  options: Partial<ValidationOptions> = {}
): Promise<{ success: boolean; validatedData?: any; errors?: any }> => {
  try {
    // Skip validation for delete operations unless specifically requested
    if (operation === 'delete' && !options.strict) {
      return { success: true, validatedData: data };
    }

    const validation = validateByDataType(data, dataType, options);

    // Log validation results for monitoring
    if (!validation.valid) {
      console.warn(`Validation failed for ${dataType} ${operation}:`, validation.errors);
    }

    if (Object.keys(validation.warnings).length > 0) {
      console.warn(`Validation warnings for ${dataType} ${operation}:`, validation.warnings);
    }

    // In non-strict mode, allow operations to proceed even with validation errors
    const shouldProceed = validation.valid || !options.strict;

    return {
      success: shouldProceed,
      validatedData: validation.sanitizedData,
      errors: validation.valid ? undefined : validation.errors
    };
  } catch (error) {
    console.error(`Error in validation middleware for ${dataType} ${operation}:`, error);
    // Always allow operations to proceed if validation system fails
    return { success: true, validatedData: data };
  }
};
