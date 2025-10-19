import { Metadata } from 'next';
import ProfileInfo from './_components/profileInfo';
import ChangePassword from './_components/changePassword';
import AddressesSection from './_components/addressesSection';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Profile - Account' };
}

export default async function Page() {
  return (
    <main className="flex flex-col gap-7">
      <h1 className="text-2xl font-semibold">Profile</h1>
      {/* Editable Profile Info */}
      <ProfileInfo />
      {/* Addresses */}
      <AddressesSection />
      {/* Change Password */}
      <ChangePassword />
    </main>
  );
}
