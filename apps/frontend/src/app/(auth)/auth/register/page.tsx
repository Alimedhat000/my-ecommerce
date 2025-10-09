import { Metadata } from 'next';
import { RegisterCard } from '../_components/registerCard';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Register',
    description: `Revan Register Form`,
  };
}

export default function RegisterPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <RegisterCard />
    </div>
  );
}
