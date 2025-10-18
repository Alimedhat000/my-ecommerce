import { AlertCircle } from 'lucide-react';
import { Metadata } from 'next';
import ProfileInfo from './_components/profileInfo';
import ChangePassword from './_components/changePassword';

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Profile - Account' };
}

export default async function Page() {
  const user = {
    name: '',
    email: 'alimedhat000@gmail.com',
    addresses: [],
  };

  return (
    <main className="flex flex-col gap-7">
      <h1 className="text-2xl font-semibold">Profile</h1>

      {/* Editable Profile Info */}
      <ProfileInfo />

      {/* Addresses */}
      <section className="rounded-2xl bg-[#EDEDED] p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-medium">Addresses</h2>
          <button className="flex items-center gap-1 font-medium text-orange-500">
            <span className="text-lg">+</span> Add
          </button>
        </div>

        {user.addresses.length === 0 ? (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-5 text-gray-600">
            <span className="flex items-center gap-2">
              <AlertCircle />
              No addresses added
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {user.addresses.map((addr, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                {addr}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Change Password */}
      <ChangePassword />
    </main>
  );
}
