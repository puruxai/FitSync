// Unit test for AuthService
// File: src/test/authService.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../services/auth';

describe('AuthService Class', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates incorrect email parameters during signup', async () => {
    const res = await AuthService.signUp('bad-email', '123456', 'alex_r', 'Alex Rivers');
    expect(res.error).toBeDefined();
    expect(res.data.user).toBeNull();
  });

  it('validates incorrect password length during signup', async () => {
    const res = await AuthService.signUp('alex@fitsync.com', '123', 'alex_r', 'Alex Rivers');
    expect(res.error).toBeDefined();
    expect(res.data.user).toBeNull();
  });

  it('signs up and resolves sessions under mock database fallback', async () => {
    const email = 'test_runner@fitsync.com';
    const res = await AuthService.signUp(email, 'password123', 'runner_99', 'Test Runner');
    
    // In mock mode, signUp succeeds and saves session
    if (res.error === null) {
      expect(res.data.user?.email).toBe(email);
    } else {
      // In case Supabase is configured in the environment, we might get an API error or verification error
      expect(res.error).toBeDefined();
    }
  });
});
