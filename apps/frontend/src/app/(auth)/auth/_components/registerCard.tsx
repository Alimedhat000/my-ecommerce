'use client';

import { Button } from '@/components/ui/button';
import { FormField } from '../_components/formField';
import Image from 'next/image';
import Link from 'next/link';

import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/api/client';
import { useAuth } from '@/contexts/authContext';
import { useEffect } from 'react';

const registerSchema = z.object({
  name: z.string().min(5, 'Name must be more than 5 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof registerSchema>;

export const RegisterCard = () => {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: FormValues) => {
    try {
      const res = await api.post(`/auth/register`, data);

      if (res.data.success) {
        const { accessToken, user } = res.data.data;
        login(accessToken, user);
        router.push('/');
      }
    } catch {
      console.error('Registration failed:');
      // Optional: show error message to user
      // const errorMessage = err.response?.data?.message || 'Registration failed';
    }
  };
  return (
    <div className="min-w-[450px] rounded-2xl bg-[#ececec] p-9 shadow-sm">
      <h1 className="flex justify-center pb-5 focus:ring-0">
        <Link href="/">
          <Image
            src="/logo.svg"
            alt="Site Logo"
            width={100}
            height={30}
            priority
          />
        </Link>
      </h1>

      <form
        className="flex flex-col space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          id="name"
          label="Full Name"
          type="text"
          register={register('name')}
          error={errors.name?.message}
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          register={register('email')}
          error={errors.email?.message}
        />

        <FormField
          id="password"
          label="Password"
          type="password"
          register={register('password')}
          error={errors.password?.message}
        />

        <Button
          type="submit"
          size={'lg'}
          className="bg-foreground text-md w-full rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registering ...' : 'Register'}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="./login" className="underline hover:no-underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};
