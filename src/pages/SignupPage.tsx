import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters.'),
  username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores are allowed.'),
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword']
});

type SignupFields = z.infer<typeof signupSchema>;

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupFields) => {
    setLoading(true);
    try {
      const { success, error } = await signup(data.email, data.password, data.username, data.fullName);
      if (success) {
        toast.success('Account created! Welcome to FitSync.', { icon: '🎉' });
        navigate('/dashboard');
      } else {
        toast.error(error || 'Failed to sign up.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred during signup.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md my-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-3xl tracking-tight text-slate-900 dark:text-white mb-2">
            <span className="material-symbols-outlined text-brand-600 dark:text-brand-500 text-3xl font-bold">fit_screen</span>
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">FitSync</span>
          </Link>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Track. Improve. Compete.</p>
        </div>

        <Card className="p-8 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Create Your Account</h2>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Walker"
              leftIcon="person"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            
            <Input
              label="Username"
              type="text"
              placeholder="alex_walker"
              leftIcon="alternate_email"
              error={errors.username?.message}
              {...register('username')}
            />
            
            <Input
              label="Email Address"
              type="email"
              placeholder="athlete@fitsync.com"
              leftIcon="mail"
              error={errors.email?.message}
              {...register('email')}
            />
            
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon="lock"
              error={errors.password?.message}
              {...register('password')}
            />
            
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              leftIcon="lock"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button
              type="submit"
              className="w-full justify-center mt-6"
              isLoading={loading}
              rightIcon="rocket_launch"
            >
              Sign Up
            </Button>
          </form>

          <p className="text-center text-xs font-semibold text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-500">
              Log In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
export default SignupPage;
