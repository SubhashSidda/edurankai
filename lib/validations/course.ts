import { CourseInput } from '../types.ts';

export interface CourseValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  normalizedData?: CourseInput;
}

export function normalizeCourseInput(input: Partial<CourseInput>): CourseInput {
  return {
    code: (input.code || '').trim().toUpperCase(),
    name: (input.name || '').trim(),
    department: (input.department || '').trim(),
    credit_hours: Number(input.credit_hours) || 3,
  };
}

export function validateCourseInput(data: any): CourseValidationResult {
  const errors: Record<string, string> = {};

  if (!data || typeof data !== 'object') {
    return {
      isValid: false,
      errors: { form: 'Invalid course payload.' },
    };
  }

  const normalized = normalizeCourseInput(data);

  if (!normalized.code) {
    errors.code = 'Course code is required (e.g., CS-101).';
  } else if (normalized.code.length < 2 || normalized.code.length > 30) {
    errors.code = 'Course code must be between 2 and 30 characters.';
  }

  if (!normalized.name) {
    errors.name = 'Course name is required.';
  } else if (normalized.name.length < 3 || normalized.name.length > 120) {
    errors.name = 'Course name must be between 3 and 120 characters.';
  }

  if (!normalized.department) {
    errors.department = 'Department name is required.';
  } else if (normalized.department.length < 2 || normalized.department.length > 80) {
    errors.department = 'Department must be between 2 and 80 characters.';
  }

  if (isNaN(normalized.credit_hours) || normalized.credit_hours < 1 || normalized.credit_hours > 12) {
    errors.credit_hours = 'Credit hours must be a number between 1 and 12.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedData: normalized,
  };
}
