// Centralized validation utilities

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Form validation schemas
export const validationSchemas = {
  email: (email: string): ValidationError | null => {
    if (!email.trim()) {
      return { field: 'email', message: 'Email is required' };
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return { field: 'email', message: 'Please enter a valid email address' };
    }
    return null;
  },

  required: (value: string, fieldName: string): ValidationError | null => {
    if (!value || !value.trim()) {
      return { field: fieldName, message: `${fieldName} is required` };
    }
    return null;
  },

  phone: (phone: string): ValidationError | null => {
    if (!phone || !phone.trim()) {
      return { field: 'contact', message: 'Contact number is required' };
    }
    // Basic phone validation - can be enhanced
    if (phone.length < 8) {
      return { field: 'contact', message: 'Please enter a valid contact number' };
    }
    return null;
  },

  meetingTitle: (title: string): ValidationError | null => {
    if (!title || !title.trim()) {
      return { field: 'title', message: 'Meeting title is required' };
    }
    if (title.length < 3) {
      return { field: 'title', message: 'Meeting title must be at least 3 characters' };
    }
    return null;
  },

  meetingDate: (date: string): ValidationError | null => {
    if (!date) {
      return { field: 'date', message: 'Meeting date is required' };
    }
    const selectedDate = new Date(date);
    const now = new Date();
    if (selectedDate < now) {
      return { field: 'date', message: 'Meeting date cannot be in the past' };
    }
    return null;
  },

  password: (password: string): ValidationError | null => {
    if (!password || password.length < 6) {
      return { field: 'password', message: 'Password must be at least 6 characters' };
    }
    return null;
  }
};

// Validation functions for specific forms
export const validateRegistrationForm = (formData: any, isInternalMeeting: boolean): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  const requiredFields = ['name', 'designation', 'contact', 'email'];
  requiredFields.forEach(field => {
    const error = validationSchemas.required(formData[field], field);
    if (error) errors.push(error);
  });

  // Email validation
  const emailError = validationSchemas.email(formData.email);
  if (emailError) errors.push(emailError);

  // Phone validation
  const phoneError = validationSchemas.phone(formData.contact);
  if (phoneError) errors.push(phoneError);

  // Organization validation (required except for internal meetings)
  if (!isInternalMeeting) {
    const orgError = validationSchemas.required(formData.organization, 'organization');
    if (orgError) errors.push(orgError);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateMeetingForm = (formData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  const requiredFields = ['title', 'date', 'location', 'sector', 'meetingCategory'];
  requiredFields.forEach(field => {
    const error = validationSchemas.required(formData[field], field);
    if (error) errors.push(error);
  });

  // Specific validations
  const titleError = validationSchemas.meetingTitle(formData.title);
  if (titleError) errors.push(titleError);

  const dateError = validationSchemas.meetingDate(formData.date);
  if (dateError) errors.push(dateError);

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateUserForm = (formData: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Required fields
  const requiredFields = ['name', 'email', 'password'];
  requiredFields.forEach(field => {
    const error = validationSchemas.required(formData[field], field);
    if (error) errors.push(error);
  });

  // Email validation
  const emailError = validationSchemas.email(formData.email);
  if (emailError) errors.push(emailError);

  // Password validation
  const passwordError = validationSchemas.password(formData.password);
  if (passwordError) errors.push(passwordError);

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Helper function to convert validation errors to form errors object
export const convertValidationErrorsToFormErrors = (errors: ValidationError[]): Record<string, string> => {
  const formErrors: Record<string, string> = {};
  errors.forEach(error => {
    formErrors[error.field] = error.message;
  });
  return formErrors;
}; 