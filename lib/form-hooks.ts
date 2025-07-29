// Custom form hooks for reducing boilerplate

import React from 'react';
import { validateRegistrationForm, validateMeetingForm, validateUserForm, convertValidationErrorsToFormErrors } from './validation';

// Generic form hook
export const useForm = <T extends Record<string, any>>(initialData: T) => {
  const [formData, setFormData] = React.useState<T>(initialData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateField = React.useCallback((field: keyof T, value: any) => {
    setFormData((prev: T) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as string]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const updateErrors = React.useCallback((newErrors: Record<string, string>) => {
    setErrors(newErrors);
  }, []);

  const resetForm = React.useCallback(() => {
    setFormData(initialData);
    setErrors({});
    setIsSubmitting(false);
  }, [initialData]);

  const setSubmitting = React.useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    setSubmitting
  };
};

// Registration form hook
export const useRegistrationForm = (meeting: any) => {
  const initialData = {
    name: '',
    designation: '',
    organization: '',
    contact: '',
    email: '',
    signatureData: ''
  };

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    setSubmitting
  } = useForm(initialData);

  const validateForm = React.useCallback(() => {
    const isInternalMeeting = meeting?.meetingCategory === 'INTERNAL';
    const validation = validateRegistrationForm(formData, isInternalMeeting);
    
    if (!validation.isValid) {
      const formErrors = convertValidationErrorsToFormErrors(validation.errors);
      updateErrors(formErrors);
      return false;
    }
    
    return true;
  }, [formData, meeting, updateErrors]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    setSubmitting,
    validateForm
  };
};

// Meeting form hook
export const useMeetingForm = (initialMeeting?: any) => {
  const initialData = {
    title: initialMeeting?.title || '',
    description: initialMeeting?.description || '',
    date: initialMeeting?.date ? new Date(initialMeeting.date).toISOString().slice(0, 16) : '',
    location: initialMeeting?.location || '',
    sector: initialMeeting?.sector || '',
    creatorType: initialMeeting?.creatorType || 'ORG',
    meetingCategory: initialMeeting?.meetingCategory || '',
    meetingType: initialMeeting?.meetingType || 'PHYSICAL',
    onlineMeetingUrl: initialMeeting?.onlineMeetingUrl || '',
    organization: initialMeeting?.organization || ''
  };

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    setSubmitting
  } = useForm(initialData);

  const validateForm = React.useCallback(() => {
    const validation = validateMeetingForm(formData);
    
    if (!validation.isValid) {
      const formErrors = convertValidationErrorsToFormErrors(validation.errors);
      updateErrors(formErrors);
      return false;
    }
    
    return true;
  }, [formData, updateErrors]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    setSubmitting,
    validateForm
  };
};

// User form hook
export const useUserForm = (initialUser?: any) => {
  const initialData = {
    name: initialUser?.name || '',
    email: initialUser?.email || '',
    password: '',
    role: initialUser?.role || 'USER',
    department: initialUser?.department || '',
    designation: initialUser?.designation || ''
  };

  const {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    setSubmitting
  } = useForm(initialData);

  const validateForm = React.useCallback(() => {
    const validation = validateUserForm(formData);
    
    if (!validation.isValid) {
      const formErrors = convertValidationErrorsToFormErrors(validation.errors);
      updateErrors(formErrors);
      return false;
    }
    
    return true;
  }, [formData, updateErrors]);

  return {
    formData,
    errors,
    isSubmitting,
    updateField,
    updateErrors,
    resetForm,
    setSubmitting,
    validateForm
  };
};

// API submission hook
export const useApiSubmission = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [success, setSuccess] = React.useState<string>('');

  const submitRequest = React.useCallback(async <T>(
    requestFn: () => Promise<T>,
    successMessage?: string
  ): Promise<T | null> => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const result = await requestFn();
      setSuccess(successMessage || 'Operation completed successfully');
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const clearMessages = React.useCallback(() => {
    setError('');
    setSuccess('');
  }, []);

  return {
    isSubmitting,
    error,
    success,
    submitRequest,
    clearMessages
  };
};

// File upload hook
export const useFileUpload = () => {
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const uploadFile = React.useCallback(async (
    file: File,
    uploadUrl: string,
    additionalData?: Record<string, any>
  ): Promise<string | null> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      setUploadProgress(100);
      return result.filePath || result.url;
    } catch (error) {
      console.error('File upload error:', error);
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadFile
  };
}; 