import Link from 'next/link';

interface OrderFooterProps {
  orderId: number;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: string;
}

export default function OrderFooter({
  orderId,
  address,
  status,
}: OrderFooterProps) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
      <div className="text-sm text-gray-600">
        <p className="font-medium">Shipping to:</p>
        <p>
          {address.street}, {address.city}, {address.state} {address.postalCode}
        </p>
      </div>

      {/* <div className="flex gap-2"> */}
      {/*   <Link */}
      {/*     href={`/user/orders/${orderId}`} */}
      {/*     className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium transition hover:bg-gray-50" */}
      {/*   > */}
      {/*     View Details */}
      {/*   </Link> */}
      {/*   {status.toLowerCase() === 'delivered' && ( */}
      {/*     <Link */}
      {/*       href={`/user/orders/${orderId}/review`} */}
      {/*       className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800" */}
      {/*     > */}
      {/*       Leave Review */}
      {/*     </Link> */}
      {/*   )} */}
      {/* </div> */}
    </div>
  );
}
