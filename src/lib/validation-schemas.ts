import { z } from 'zod';
import { format } from 'date-fns';

// Common validation messages
export const VALIDATION_MESSAGES = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be at most ${max} characters`,
  min: (min: number) => `Must be at least ${min}`,
  max: (max: number) => `Must be at most ${max}`,
  url: 'Please enter a valid URL',
  passwordMismatch: 'Passwords do not match',
  invalidDate: 'Please enter a valid date',
  invalidNumber: 'Please enter a valid number',
  invalidPhone: 'Please enter a valid phone number',
  invalidPostalCode: 'Please enter a valid postal code',
  invalidCreditCard: 'Please enter a valid credit card number',
  invalidCvv: 'Please enter a valid CVV',
  invalidExpiryDate: 'Please enter a valid expiry date',
  invalidTime: 'Please enter a valid time',
  invalidDateTime: 'Please enter a valid date and time',
  invalidColor: 'Please enter a valid color code',
  invalidIpAddress: 'Please enter a valid IP address',
  invalidMacAddress: 'Please enter a valid MAC address',
  invalidDomain: 'Please enter a valid domain',
  invalidUsername: 'Username can only contain letters, numbers, and underscores',
  invalidPassword: 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character',
};

// Common validation helpers
export const commonValidators = {
  requiredString: (message = VALIDATION_MESSAGES.required) => 
    z.string().min(1, { message }),
    
  optionalString: () => 
    z.string().optional(),
    
  email: (message = VALIDATION_MESSAGES.email) => 
    z.string().email({ message }),
    
  url: (message = VALIDATION_MESSAGES.url) => 
    z.string().url({ message }),
    
  phone: (message = VALIDATION_MESSAGES.invalidPhone) => 
    z.string().regex(/^\+?[0-9\s-()]{10,20}$/, { message }),
    
  password: (message = VALIDATION_MESSAGES.invalidPassword) => 
    z.string()
      .min(8, { message: VALIDATION_MESSAGES.minLength(8) })
      .regex(/[a-z]/, { message: 'Must include lowercase letter' })
      .regex(/[A-Z]/, { message: 'Must include uppercase letter' })
      .regex(/[0-9]/, { message: 'Must include number' })
      .regex(/[^a-zA-Z0-9]/, { message: 'Must include special character' }),
      
  confirmPassword: (field = 'password', message = VALIDATION_MESSAGES.passwordMismatch) => 
    z.string()
      .min(1, { message: VALIDATION_MESSAGES.required })
      .refine((val, ctx) => val === ctx.parent[field], { message }),
      
  date: (message = VALIDATION_MESSAGES.invalidDate) => 
    z.preprocess((val) => {
      if (!val) return null;
      if (val instanceof Date) return val;
      if (typeof val === 'string' || typeof val === 'number') {
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
      }
      return null;
    }, z.date({ required_error: message })),
    
  dateString: (formatStr = 'yyyy-MM-dd', message = VALIDATION_MESSAGES.invalidDate) => 
    z.string().refine((val) => {
      try {
        const date = new Date(val);
        return !isNaN(date.getTime()) && format(date, formatStr) === val;
      } catch (e) {
        return false;
      }
    }, { message }),
    
  number: (message = VALIDATION_MESSAGES.invalidNumber) => 
    z.preprocess((val) => {
      if (val === '') return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }, z.number({ invalid_type_error: message })),
    
  positiveNumber: (message = 'Must be a positive number') => 
    commonValidators.number(message).refine((val) => val > 0, { message }),
    
  nonNegativeNumber: (message = 'Must be a non-negative number') => 
    commonValidators.number(message).refine((val) => val >= 0, { message }),
    
  integer: (message = 'Must be an integer') => 
    commonValidators.number(message).refine((val) => Number.isInteger(val), { message }),
    
  positiveInteger: (message = 'Must be a positive integer') => 
    commonValidators.integer(message).refine((val) => val > 0, { message }),
    
  nonNegativeInteger: (message = 'Must be a non-negative integer') => 
    commonValidators.integer(message).refine((val) => val >= 0, { message }),
    
  boolean: (message = 'Must be a boolean') => 
    z.preprocess((val) => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return Boolean(val);
    }, z.boolean({ required_error: message })),
    
  array: <T extends z.ZodTypeAny>(schema: T, message = 'Must be an array') => 
    z.array(schema, { required_error: message }),
    
  nonEmptyArray: <T extends z.ZodTypeAny>(schema: T, message = 'Must not be empty') => 
    z.array(schema).min(1, { message }),
    
  enum: <T extends [string, ...string[]]>(values: T, message = 'Invalid value') => 
    z.enum(values, { required_error: message }),
    
  object: <T extends z.ZodRawShape>(shape: T, message = 'Must be an object') => 
    z.object(shape, { required_error: message }),
    
  record: <T extends z.ZodTypeAny>(valueType: T, message = 'Must be a record') => 
    z.record(valueType, { required_error: message }),
};

// Common schemas
export const commonSchemas = {
  // Authentication
  login: z.object({
    email: commonValidators.email(),
    password: commonValidators.requiredString('Password is required'),
    rememberMe: z.boolean().optional(),
  }),
  
  register: z.object({
    name: commonValidators.requiredString('Name is required'),
    email: commonValidators.email(),
    password: commonValidators.password(),
    confirmPassword: commonValidators.confirmPassword('password'),
    terms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms and conditions',
    }),
  }),
  
  forgotPassword: z.object({
    email: commonValidators.email(),
  }),
  
  resetPassword: z.object({
    password: commonValidators.password(),
    confirmPassword: commonValidators.confirmPassword('password'),
    token: z.string().min(1, 'Token is required'),
  }),
  
  // User profile
  profile: z.object({
    firstName: commonValidators.requiredString('First name is required'),
    lastName: commonValidators.requiredString('Last name is required'),
    email: commonValidators.email(),
    phone: commonValidators.phone(),
    avatar: commonValidators.url().optional().or(z.literal('')),
    bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
    location: z.string().max(100, 'Location must be at most 100 characters').optional(),
    website: commonValidators.url().optional().or(z.literal('')),
    company: z.string().max(100, 'Company must be at most 100 characters').optional(),
  }),
  
  // Settings
  settings: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      sms: z.boolean(),
      newsletter: z.boolean(),
    }),
    preferences: z.object({
      theme: z.enum(['light', 'dark', 'system']),
      language: z.string(),
      timezone: z.string(),
      dateFormat: z.string(),
      timeFormat: z.string(),
    }),
  }),
  
  // Address
  address: z.object({
    street: commonValidators.requiredString('Street is required'),
    city: commonValidators.requiredString('City is required'),
    state: commonValidators.requiredString('State is required'),
    postalCode: commonValidators.requiredString('Postal code is required'),
    country: commonValidators.requiredString('Country is required'),
    isDefault: z.boolean().optional(),
  }),
  
  // Payment method
  paymentMethod: z.object({
    cardNumber: z.string()
      .min(13, 'Card number must be at least 13 digits')
      .max(19, 'Card number must be at most 19 digits')
      .regex(/^[0-9\s-]+$/, 'Invalid card number'),
    cardHolder: commonValidators.requiredString('Card holder name is required'),
    expiryDate: z.string()
      .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Invalid expiry date (MM/YY)')
      .refine((val) => {
        if (!val) return false;
        const [month, year] = val.split('/').map(Number);
        const now = new Date();
        const currentYear = now.getFullYear() % 100;
        const currentMonth = now.getMonth() + 1;
        
        return (
          year > currentYear || 
          (year === currentYear && month >= currentMonth)
        );
      }, 'Card has expired'),
    cvv: z.string()
      .min(3, 'CVV must be at least 3 digits')
      .max(4, 'CVV must be at most 4 digits')
      .regex(/^[0-9]+$/, 'Invalid CVV'),
    isDefault: z.boolean().optional(),
  }),
  
  // File upload
  fileUpload: z.object({
    file: z.instanceof(File)
      .refine((file) => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
      .refine(
        (file) => ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type),
        'Only JPEG, PNG, and PDF files are allowed'
      ),
    description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  }),
  
  // Search and filters
  search: z.object({
    query: z.string().optional(),
    filters: z.record(z.any()).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: commonValidators.positiveInteger('Page must be a positive integer').default(1),
    limit: commonValidators.positiveInteger('Limit must be a positive integer').default(10),
  }),
};

// Helper function to create a schema with common fields
export function withCommonFields<T extends z.ZodRawShape>(
  schema: T,
  options: {
    timestamps?: boolean;
    createdBy?: boolean;
    updatedBy?: boolean;
    deletedAt?: boolean;
  } = {}
) {
  const { timestamps = true, createdBy = true, updatedBy = true, deletedAt = false } = options;
  
  return z.object({
    ...schema,
    ...(timestamps && {
      createdAt: z.date().or(z.string().datetime()),
      updatedAt: z.date().or(z.string().datetime()).optional(),
    }),
    ...(createdBy && { createdBy: z.string().or(z.number()) }),
    ...(updatedBy && { updatedBy: z.string().or(z.number()).optional() }),
    ...(deletedAt && { deletedAt: z.date().or(z.string().datetime()).nullable() }),
  });
}

// Helper function to create a paginated response schema
export function paginatedResponse<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
      hasNextPage: z.boolean(),
      hasPreviousPage: z.boolean(),
    }),
  });
}

// Export types
export type LoginInput = z.infer<typeof commonSchemas.login>;
export type RegisterInput = z.infer<typeof commonSchemas.register>;
export type ForgotPasswordInput = z.infer<typeof commonSchemas.forgotPassword>;
export type ResetPasswordInput = z.infer<typeof commonSchemas.resetPassword>;
export type ProfileInput = z.infer<typeof commonSchemas.profile>;
export type SettingsInput = z.infer<typeof commonSchemas.settings>;
export type AddressInput = z.infer<typeof commonSchemas.address>;
export type PaymentMethodInput = z.infer<typeof commonSchemas.paymentMethod>;
export type FileUploadInput = z.infer<typeof commonSchemas.fileUpload>;
export type SearchInput = z.infer<typeof commonSchemas.search>;
