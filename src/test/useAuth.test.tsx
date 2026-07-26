// Unit test for useAuth hook context provider wrapper
// File: src/test/useAuth.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Simple consumer hook component
const AuthConsumer = () => {
  const context = useAuth();
  return (
    <div>
      <span data-testid="user-email">{context.user?.email || 'Logged Out'}</span>
    </div>
  );
};

describe('useAuth AuthContext wrapper', () => {
  it('loads with initial default states', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <AuthConsumer />
        </AuthProvider>
      );
    });
    expect(screen.getByTestId('user-email')).toBeInTheDocument();
  });
});
