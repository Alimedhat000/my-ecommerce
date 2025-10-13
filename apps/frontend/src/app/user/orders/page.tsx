import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Orders - Account',
  };
}

export default function Page() {
  const orders = [
    { id: 1, date: '2 Nov 2025', items: [{ id: 1 }, { id: 2 }], total: 50 },
    // { id: 1, date: '2 Nov 2025', items: [{ id: 1 }, { id: 2 }], total: 50 },
    // { id: 1, date: '2 Nov 2025', items: [{ id: 1 }, { id: 2 }], total: 50 },
  ]; // Replace with fetched or passed data later

  return (
    <main className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold">Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-[#EDEDED] p-14 text-center">
          <h2 className="text-lg font-medium">No orders yet</h2>
          <p className="text-gray-600">Go to the store to place an order</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Order #{order.id}</span>
                <span className="text-sm text-gray-500">{order.date}</span>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </div>
              <div className="mt-1 font-semibold">${order.total}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
