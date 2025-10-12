import { Pen } from 'lucide-react';

export default function Page() {
  const user = {
    name: '',
    email: 'alimedhat000@gmail.com',
    addresses: [],
  };

  return (
    <main className="flex flex-col gap-7">
      <h1 className="text-2xl font-semibold">Profile</h1>

      {/* Profile Info */}
      <section className="rounded-2xl bg-[#EDEDED] p-6">
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-gray-600">Name</span>
            <div className="flex items-center gap-2">
              <span className="text-gray-800">
                {user.name || (
                  <span className="text-gray-400 italic">Not set</span>
                )}
              </span>
              <Pen className="w-4 text-orange-500" />
            </div>
          </div>

          <div>
            <span className="text-gray-600">Email</span>
            <div className="text-gray-800">{user.email}</div>
          </div>
        </div>
      </section>

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m0 3.75h.007v.008H12v-.008z"
                />
              </svg>
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
      <section className="rounded-2xl bg-[#EDEDED] p-6">
        <h2 className="mb-3 font-medium">Change Password</h2>

        <form className="flex max-w-sm flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="currentPassword" className="text-gray-600">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="newPassword" className="text-gray-600">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-gray-600">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-fit rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            Update Password
          </button>
        </form>
      </section>
    </main>
  );
}
