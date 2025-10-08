import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { FormField } from '../_components/formField';

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="min-w-[450px] rounded-2xl bg-[#ececec] p-9">
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

        <form className="flex flex-col space-y-4">
          <FormField id="email" label="Email" type="email" />

          <FormField id="password" label="Password" type="password" />

          <Button
            type="submit"
            size={'lg'}
            className="bg-foreground text-md w-full rounded-lg"
          >
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link href="./register" className="underline hover:no-underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
