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

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});

type LoginFields = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    try {
      // In offline/fallback mode, password doesn't matter. In live mode it goes to Supabase.
      const { success, error } = await login(data.email);
      if (success) {
        toast.success('Successfully logged in!', { icon: '👋' });
        navigate('/dashboard');
      } else {
        toast.error(error || 'Failed to login. Please check credentials.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-black text-3xl tracking-tight text-slate-900 dark:text-white mb-2">
            <span className="material-symbols-outlined text-brand-600 dark:text-brand-500 text-3xl font-bold">fit_screen</span>
            <span className="bg-gradient-to-r from-brand-600 to-brand-500 bg-clip-text text-transparent">FitSync</span>
          </Link>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Track. Improve. Compete.</p>
        </div>

        <Card className="p-8 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Welcome Back</h2>
          
          <form onSubmit={handleSubmit(onSubmit)}>
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

            <div className="flex justify-end mb-6">
              <Link to="/forgot-password" className="text-xs font-semibold text-brand-600 hover:text-brand-500">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full justify-center mb-4"
              isLoading={loading}
              rightIcon="arrow_forward"
            >
              Sign In with Email
            </Button>
          </form>


          <p className="text-center text-xs font-semibold text-slate-400 mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-600 hover:text-brand-500">
              Sign Up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
export default LoginPage;
