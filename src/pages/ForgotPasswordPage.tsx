import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address.')
});

type ForgotFields = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFields>({
    resolver: zodResolver(forgotSchema)
  });

  const onSubmit = async (_data: ForgotFields) => {
    setLoading(true);
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    setSubmitted(true);
    toast.success('Password reset link sent to your email!', { icon: '✉️' });
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Reset Password</h2>
          
          {!submitted ? (
            <>
              <p className="text-xs font-semibold text-slate-400 mb-6">
                Enter your email address below, and we'll send you instructions on how to reset your password.
              </p>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="athlete@fitsync.com"
                  leftIcon="mail"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Button
                  type="submit"
                  className="w-full justify-center mt-6"
                  isLoading={loading}
                  rightIcon="send"
                >
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-5xl text-emerald-500 mb-4 animate-bounce">
                mark_email_read
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Check Your Inbox</p>
              <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                We've sent a password reset link to your email address. Follow the instructions in the email to set a new password.
              </p>
              <Button
                variant="outline"
                className="mt-8 px-6"
                onClick={() => setSubmitted(false)}
              >
                Resend Link
              </Button>
            </div>
          )}

          <p className="text-center text-xs font-semibold text-slate-400 mt-8">
            Back to{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-500">
              Log In
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
