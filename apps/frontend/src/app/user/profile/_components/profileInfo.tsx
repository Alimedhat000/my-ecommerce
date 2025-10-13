'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Pen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileInfoProps {
  user: {
    name: string;
    email: string;
  };
}

export default function ProfileInfo({ user }: ProfileInfoProps) {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  });

  function onSubmit(data: ProfileForm) {
    console.log('Updated profile:', data);
    setIsEditing(false);
  }

  function handleCancel() {
    reset();
    setIsEditing(false);
  }

  return (
    <section className="rounded-2xl bg-[#EDEDED] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-medium">Profile Info</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-orange-500 hover:text-orange-600"
          >
            <Pen className="w-4" />
          </button>
        )}
      </div>

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
          className="grid-col-1 grid gap-4 md:grid-cols-2"
        >
          <div>
            <label className="text-gray-600" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              type="name"
              variant="brand"
              {...register('name')}
              aria-invalid={errors.email ? 'true' : 'false'}
              className={cn(
                'mt-1 h-10',
                errors.email
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-300 focus:border-[#ff8c42]'
              )}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
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
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
