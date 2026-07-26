// Component unit test for Button component
// File: src/test/Button.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button';

describe('Button component', () => {
  it('renders standard text children correctly', () => {
    render(<Button>Submit Session</Button>);
    expect(screen.getByText('Submit Session')).toBeInTheDocument();
  });

  it('triggers onClick handler on mouse click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Trigger Action</Button>);
    fireEvent.click(screen.getByText('Trigger Action'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays loading icon spin if isLoading is true', () => {
    render(<Button isLoading>Action Button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables interactions if disabled flag is passed', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Click Lock</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
