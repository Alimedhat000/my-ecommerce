import { Metadata } from 'next';
import { LoginCard } from '../_components/loginCard';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Login',
    description: `Revan Login Form`,
  };
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <LoginCard />
    </div>
  );
}
