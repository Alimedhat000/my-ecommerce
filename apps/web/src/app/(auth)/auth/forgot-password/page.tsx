import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { FormField } from '../_components/formField';

export default function ForgetPasswordPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
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

        <p className="mb-4 text-center text-sm text-gray-700">
          Enter your account email and we will send you a reset code
        </p>
        <form className="flex flex-col space-y-4">
          <FormField id="email" label="Email" type="email" />

          <Button
            type="submit"
            size={'lg'}
            className="bg-foreground text-md w-full rounded-lg"
          >
            Send Code
          </Button>
        </form>
      </div>
    </div>
  );
}
