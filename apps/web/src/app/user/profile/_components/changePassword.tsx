'use client';

import { api } from '@/api/client';
import { passwordRequirements } from '@/utils/passwordRequirements';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

export const passwordChangeSchema = z
  .object({
    currentPassword: z
      .string()
      .min(passwordRequirements.minLength, 'Current password is required'),
    newPassword: z
      .string()
      .min(
        passwordRequirements.minLength,
        `Password must be at least ${passwordRequirements.minLength} characters long`
      )
      .refine(
        (val) => !passwordRequirements.requireLowercase || /[a-z]/.test(val),
        {
          message: 'Password must contain at least one lowercase letter',
        }
      )
      .refine(
        (val) => !passwordRequirements.requireUppercase || /[A-Z]/.test(val),
        {
          message: 'Password must contain at least one uppercase letter',
        }
      )
      .refine(
        (val) => !passwordRequirements.requireNumbers || /[0-9]/.test(val),
        {
          message: 'Password must contain at least one number',
        }
      )
      .refine(
        (val) =>
          !passwordRequirements.requireSpecialChars || /[^a-zA-Z0-9]/.test(val),
        {
          message: 'Password must contain at least one special character',
        }
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });

type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export default function ChangePassword() {
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
  });

  const onSubmit = async (data: PasswordChangeFormData) => {
    try {
      setSuccessMessage('');
      setError('root', { message: '' }); // Clear previous errors

      const res = await api.patch('/user/update-password', data);

      if (res.data.success) {
        reset(); // Clear form after successful submission
        setSuccessMessage(res.data.message || 'Password changed successfully');
      } else {
        setError('root', {
          message: res.data.message || 'Failed to change password',
        });
      }
    } catch (error: unknown) {
      console.error('Error changing password:', error);

      let errorMessage = 'Failed to change password. Please try again.';

      if (error instanceof AxiosError) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError('root', { message: errorMessage });
    }
  };

  return (
    <section className="rounded-xl bg-[#EDEDED] p-6">
      <h3 className="mb-3 font-medium">Change Password</h3>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex max-w-sm flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="currentPassword" className="text-gray-500">
            Current Password
          </label>
          <input
            type="password"
            id="currentPassword"
            {...register('currentPassword')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
          {errors.currentPassword && (
            <p className="text-destructive text-sm">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="newPassword" className="text-gray-500">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            {...register('newPassword')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
          {errors.newPassword && (
            <p className="text-destructive text-sm">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword" className="text-gray-500">
            Confirm New Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            {...register('confirmPassword')}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
          />
          {errors.confirmPassword && (
            <p className="text-destructive text-sm">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {successMessage && (
          <p className="bg-success-bg text-success rounded-lg p-3 text-sm">
            {successMessage}
          </p>
        )}
        {errors.root && (
          <p className="text-destructive text-sm">{errors.root.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-fit rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:bg-orange-300"
        >
          {isSubmitting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </section>
  );
}
