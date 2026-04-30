'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { FormField } from '../_components/formField';
import z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';
import { api } from '@/api/client';
import { useEffect } from 'react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginCard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();

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
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await api.post('/auth/login', data);

      if (res.data) {
        const { accessToken, user } = res.data.data;
        login(accessToken, user);
        router.push('/'); // or wherever you want to redirect
      }
    } catch (err) {
      console.error('Login failed:', err);
      // Optional: Show error message to user
      // setError('Invalid credentials');
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
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
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
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <p className="mt-3 text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="./register" className="underline hover:no-underline">
          Sign up
        </Link>
      </p>
    </div>
  );
};
