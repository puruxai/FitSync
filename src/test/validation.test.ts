// Unit test for Zod Validation Schemas
// File: src/test/validation.test.ts

import { describe, it, expect } from 'vitest';
import { emailSchema, passwordSchema, usernameSchema, userRegistrationSchema } from '../utils/validation';

describe('Zod Validation Schemas', () => {
  it('should validate emails correctly', () => {
    expect(emailSchema.safeParse('valid@fitsync.com').success).toBe(true);
    expect(emailSchema.safeParse('invalid-email').success).toBe(false);
  });

  it('should validate passwords correctly', () => {
    expect(passwordSchema.safeParse('123456').success).toBe(true);
    expect(passwordSchema.safeParse('12345').success).toBe(false);
  });

  it('should validate usernames correctly', () => {
    expect(usernameSchema.safeParse('fit_sync_99').success).toBe(true);
    expect(usernameSchema.safeParse('fit-sync-99').success).toBe(false); // dash not allowed
  });

  it('should validate registration objects correctly', () => {
    const validRegistration = {
      fullName: 'Alex Rivers',
      username: 'alex_rivers',
      email: 'alex@fitsync.com',
      password: 'password123'
    };
    expect(userRegistrationSchema.safeParse(validRegistration).success).toBe(true);
  });
});
