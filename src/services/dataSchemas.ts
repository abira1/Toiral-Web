/**
 * Comprehensive data schemas for the Toiral web application
 * These schemas define the structure and validation rules for all data types
 * stored in Firebase Realtime Database.
 *
 * IMPORTANT: These schemas are designed to be backward compatible with existing data.
 * Any changes must maintain compatibility with current data structures.
 */

// Base schema interface
export interface FieldSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'phone' | 'date' | 'enum';
  required: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enumValues?: string[];
  arrayItemSchema?: FieldSchema;
  objectSchema?: { [key: string]: FieldSchema };
  label?: string;
  description?: string;
}

export interface DataSchema {
  [fieldName: string]: FieldSchema;
}

// Portfolio Item Schema
export const portfolioItemSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Portfolio ID'
  },
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Portfolio Title'
  },
  description: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 2000,
    label: 'Portfolio Description'
  },
  image: {
    type: 'url',
    required: true,
    label: 'Portfolio Image URL'
  },
  url: {
    type: 'url',
    required: true,
    label: 'Portfolio Project URL'
  },
  order: {
    type: 'number',
    required: false,
    min: 0,
    label: 'Display Order'
  }
};

// Review Schema
export const reviewSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Review ID'
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Reviewer Name'
  },
  rating: {
    type: 'number',
    required: true,
    min: 1,
    max: 5,
    label: 'Rating'
  },
  review: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 5000,
    label: 'Review Text'
  },
  date: {
    type: 'date',
    required: true,
    label: 'Review Date'
  },
  approved: {
    type: 'boolean',
    required: true,
    label: 'Approval Status'
  },
  featured: {
    type: 'boolean',
    required: false,
    label: 'Featured Status'
  },
  position: {
    type: 'number',
    required: false,
    min: 0,
    label: 'Display Position'
  },
  company: {
    type: 'string',
    required: false,
    maxLength: 200,
    label: 'Company Name'
  },
  avatar: {
    type: 'url',
    required: false,
    label: 'Avatar URL'
  }
};

// Booking Submission Schema
export const bookingSubmissionSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Booking ID'
  },
  firstName: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    label: 'First Name'
  },
  lastName: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    label: 'Last Name'
  },
  email: {
    type: 'email',
    required: true,
    label: 'Email Address'
  },
  phone: {
    type: 'phone',
    required: true,
    label: 'Phone Number'
  },
  serviceType: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Service Type'
  },
  date: {
    type: 'date',
    required: true,
    label: 'Appointment Date'
  },
  time: {
    type: 'string',
    required: true,
    pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    label: 'Appointment Time'
  },
  description: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 2000,
    label: 'Description'
  },
  status: {
    type: 'enum',
    required: true,
    enumValues: ['pending', 'approved', 'rejected'],
    label: 'Booking Status'
  },
  submittedAt: {
    type: 'date',
    required: true,
    label: 'Submission Date'
  },
  userId: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100,
    label: 'User ID'
  },
  selectedPackage: {
    type: 'string',
    required: false,
    maxLength: 100,
    label: 'Selected Package'
  }
};

// Contact Form Submission Schema
export const contactFormSubmissionSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Contact ID'
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Contact Name'
  },
  email: {
    type: 'email',
    required: true,
    label: 'Email Address'
  },
  subject: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    label: 'Subject'
  },
  message: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 5000,
    label: 'Message'
  },
  status: {
    type: 'enum',
    required: true,
    enumValues: ['new', 'read', 'replied'],
    label: 'Contact Status'
  },
  submittedAt: {
    type: 'date',
    required: true,
    label: 'Submission Date'
  },
  userId: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100,
    label: 'User ID'
  },
  userPhotoURL: {
    type: 'url',
    required: false,
    label: 'User Photo URL'
  }
};

// Team Member Schema
export const teamMemberSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Team Member ID'
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Team Member Name'
  },
  role: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Team Member Role'
  },
  image: {
    type: 'url',
    required: true,
    label: 'Team Member Image URL'
  }
};

// Company Profile Schema
export const companyProfileSchema: DataSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    label: 'Company Name'
  },
  tagline: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 500,
    label: 'Company Tagline'
  },
  logo: {
    type: 'url',
    required: true,
    label: 'Company Logo URL'
  },
  headerImage: {
    type: 'url',
    required: true,
    label: 'Header Image URL'
  }
};

// User Profile Schema
export const userProfileSchema: DataSchema = {
  displayName: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100,
    label: 'Display Name'
  },
  email: {
    type: 'email',
    required: true,
    label: 'Email Address'
  },
  phoneNumber: {
    type: 'phone',
    required: false,
    label: 'Phone Number'
  },
  photoURL: {
    type: 'url',
    required: false,
    label: 'Profile Photo URL'
  },
  uid: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'User ID'
  },
  role: {
    type: 'enum',
    required: true,
    enumValues: ['user', 'moderator', 'admin'],
    label: 'User Role'
  },
  permissions: {
    type: 'object',
    required: false,
    label: 'User Permissions'
  },
  createdAt: {
    type: 'date',
    required: false,
    label: 'Account Creation Date'
  },
  lastLogin: {
    type: 'date',
    required: false,
    label: 'Last Login Date'
  }
};

// Service Type Schema
export const serviceTypeSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Service ID'
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Service Name'
  },
  duration: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    label: 'Service Duration'
  },
  price: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    label: 'Service Price'
  },
  color: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    label: 'Service Color'
  }
};

// Pricing Package Schema
export const pricingPackageSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Package ID'
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Package Name'
  },
  price: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 50,
    label: 'Package Price'
  },
  features: {
    type: 'array',
    required: true,
    arrayItemSchema: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 200
    },
    label: 'Package Features'
  },
  popular: {
    type: 'boolean',
    required: false,
    label: 'Popular Package'
  }
};

// Notification Schema
export const notificationSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Notification ID'
  },
  type: {
    type: 'enum',
    required: true,
    enumValues: ['review', 'contact', 'booking'],
    label: 'Notification Type'
  },
  title: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 200,
    label: 'Notification Title'
  },
  message: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 1000,
    label: 'Notification Message'
  },
  timestamp: {
    type: 'date',
    required: true,
    label: 'Notification Timestamp'
  },
  read: {
    type: 'boolean',
    required: true,
    label: 'Read Status'
  },
  sourceId: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Source ID'
  },
  userName: {
    type: 'string',
    required: false,
    minLength: 1,
    maxLength: 100,
    label: 'User Name'
  }
};

// Schema Registry - Maps data types to their schemas
export const schemaRegistry: { [key: string]: DataSchema } = {
  portfolioItem: portfolioItemSchema,
  review: reviewSchema,
  bookingSubmission: bookingSubmissionSchema,
  contactFormSubmission: contactFormSubmissionSchema,
  teamMember: teamMemberSchema,
  companyProfile: companyProfileSchema,
  userProfile: userProfileSchema,
  serviceType: serviceTypeSchema,
  pricingPackage: pricingPackageSchema,
  notification: notificationSchema
};

// Get schema by data type
export const getSchema = (dataType: string): DataSchema | null => {
  return schemaRegistry[dataType] || null;
};

// List all available schemas
export const getAvailableSchemas = (): string[] => {
  return Object.keys(schemaRegistry);
};

// Enhanced Permission Schema (additive extension - does not modify existing permissions)
export const enhancedPermissionSchema: DataSchema = {
  id: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Permission ID'
  },
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Permission Name'
  },
  description: {
    type: 'string',
    required: false,
    maxLength: 500,
    label: 'Permission Description'
  },
  category: {
    type: 'enum',
    required: true,
    enumValues: ['content', 'user_management', 'system', 'analytics', 'security'],
    label: 'Permission Category'
  },
  level: {
    type: 'number',
    required: true,
    min: 0,
    max: 10,
    label: 'Permission Level'
  },
  inheritsFrom: {
    type: 'array',
    required: false,
    arrayItemSchema: {
      type: 'string',
      required: true,
      minLength: 1,
      maxLength: 100
    },
    label: 'Inherited Permissions'
  },
  conditions: {
    type: 'object',
    required: false,
    label: 'Permission Conditions'
  },
  expiresAt: {
    type: 'date',
    required: false,
    label: 'Permission Expiration'
  },
  createdAt: {
    type: 'date',
    required: true,
    label: 'Creation Date'
  },
  createdBy: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100,
    label: 'Created By User ID'
  }
};
