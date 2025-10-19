import Link from 'next/link';

export default function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#EDEDED] p-14 text-center">
      <h2 className="text-lg font-medium">No orders yet</h2>
      <p className="text-gray-600">Go to the store to place an order</p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-black px-6 py-2 text-white transition hover:bg-gray-800"
      >
        Browse Products
      </Link>
    </div>
  );
}
