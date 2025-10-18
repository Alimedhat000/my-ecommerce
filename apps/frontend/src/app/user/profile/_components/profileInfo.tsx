'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pen, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { api } from '@/api/client';
import { useAuth } from '@/contexts/authContext';
import { AxiosError } from 'axios';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface User {
  name: string;
  email: string;
}

export default function ProfileInfo() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated || authLoading) return;

      try {
        setLoading(true);
        const res = await api.get('/user/me');
        const userData = res.data.user || res.data.data || res.data;
        setUser(userData);

        // Update form with fetched data
        reset({
          name: userData.name || '',
          email: userData.email || '',
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, authLoading, reset]);

  async function onSubmit(data: ProfileForm) {
    try {
      setUpdateLoading(true);
      setError(null);

      const res = await api.patch('/user/me', data);
      const updatedUser = res.data.user || res.data.data || res.data;

      setUser(updatedUser);
      setIsEditing(false);

      // Optional: Show success message
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      const error = err as AxiosError<{ message?: string }>;
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  }

  function handleCancel() {
    reset({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError(null);
  }

  // Loading state
  if (loading) {
    return (
      <section className="rounded-2xl bg-[#EDEDED] p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      </section>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <section className="rounded-2xl bg-[#EDEDED] p-6">
        <div className="text-destructive text-center">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-orange-500 hover:text-orange-600"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="rounded-2xl bg-[#EDEDED] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium">Profile Info</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-orange-500 hover:text-orange-600"
            disabled={updateLoading}
          >
            <Pen className="w-4" />
          </button>
        )}
      </div>

      {error && isEditing && (
        <div className="text-destructive mb-4 rounded-lg bg-red-50 p-3 text-sm">
          {error}
        </div>
      )}

      {!isEditing ? (
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-gray-600">Name</span>
            <div className="text-gray-800">
              {user.name || (
                <span className="text-gray-400 italic">Not set</span>
              )}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Email</span>
            <div className="text-gray-800">{user.email}</div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          <div>
            <label className="text-gray-600" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              type="text"
              variant="brand"
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
              className={cn(
                'mt-1 h-10',
                errors.name
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-300 focus:border-[#ff8c42]'
              )}
              disabled={updateLoading}
            />
            {errors.name && (
              <p className="text-destructive mt-1 text-xs">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-gray-600" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              variant="brand"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
              className={cn(
                'mt-1 h-10',
                errors.email
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-300 focus:border-[#ff8c42]'
              )}
              disabled={updateLoading}
            />
            {errors.email && (
              <p className="text-destructive mt-1 text-xs">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={updateLoading}
            >
              {updateLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {updateLoading ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={updateLoading}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
