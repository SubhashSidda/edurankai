import { StudentInput } from '../types.ts';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  normalizedData?: StudentInput;
}

// RFC 5322 compliant simplified email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// E.164 and common international/local telephone formats
const PHONE_REGEX = /^(\+?\d{1,4}[\s-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,5}$/;

// Standard UUID format
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Normalizes student input data (trims whitespace, converts email to lowercase)
 */
export function normalizeStudentInput(input: Partial<StudentInput>): StudentInput {
  return {
    full_name: (input.full_name || '').trim(),
    email: (input.email || '').trim().toLowerCase(),
    phone_number: (input.phone_number || '').trim(),
    course_id: (input.course_id || '').trim(),
    enrollment_date: (input.enrollment_date || '').trim(),
    status: (input.status === 'Inactive' ? 'Inactive' : 'Active') as 'Active' | 'Inactive',
  };
}

/**
 * Validates student input fields strictly according to hiring challenge requirements
 */
export function validateStudentInput(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Invalid student payload: Expected JSON object.' },
    };
  }

  const normalized = normalizeStudentInput(data);

  // 1. Full Name Validation
  if (!normalized.full_name) {
    errors.full_name = 'Full name is required.';
  } else if (normalized.full_name.length < 2) {
    errors.full_name = 'Full name must be at least 2 characters.';
  } else if (normalized.full_name.length > 100) {
    errors.full_name = 'Full name must not exceed 100 characters.';
  }

  // 2. Email Validation
  if (!normalized.email) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(normalized.email)) {
    errors.email = 'Please provide a valid email address (e.g., student@university.edu).';
  } else if (normalized.email.length > 255) {
    errors.email = 'Email address must not exceed 255 characters.';
  }

  // 3. Phone Number Validation
  if (!normalized.phone_number) {
    errors.phone_number = 'Phone number is required.';
  } else {
    // Check digits count (must have at least 7 digits)
    const digitsOnly = normalized.phone_number.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 16) {
      errors.phone_number = 'Phone number must contain between 7 and 16 digits.';
    } else if (!PHONE_REGEX.test(normalized.phone_number)) {
      errors.phone_number = 'Please provide a valid phone number (e.g., +1 (555) 234-5678).';
    }
  }

  // 4. Course ID Validation
  if (!normalized.course_id) {
    errors.course_id = 'Course selection is required.';
  } else if (!UUID_REGEX.test(normalized.course_id)) {
    errors.course_id = 'Invalid course identifier format.';
  }

  // 5. Enrollment Date Validation
  if (!normalized.enrollment_date) {
    errors.enrollment_date = 'Enrollment date is required.';
  } else {
    const parsedDate = new Date(normalized.enrollment_date);
    if (isNaN(parsedDate.getTime())) {
      errors.enrollment_date = 'Enrollment date must be a valid date (YYYY-MM-DD).';
    }
  }

  // 6. Status Validation
  if (!['Active', 'Inactive'].includes(normalized.status)) {
    errors.status = 'Status must be either "Active" or "Inactive".';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: normalized,
  };
}
