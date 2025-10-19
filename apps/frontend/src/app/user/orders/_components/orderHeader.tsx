interface OrderHeaderProps {
  id: number;
  status: string;
  createdAt: string;
  totalAmount: number;
}

const statusColors: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
  shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Shipped' },
  delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
};

export default function OrderHeader({
  id,
  status,
  createdAt,
  totalAmount,
}: OrderHeaderProps) {
  const statusConfig =
    statusColors[status.toLowerCase()] || statusColors.pending;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 pb-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Order #{id}</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}
          >
            {statusConfig.label}
          </span>
        </div>
        <p className="text-sm text-gray-500">
          Placed on {formatDate(createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Total</p>
        <p className="text-xl font-bold">${totalAmount.toFixed(2)}</p>
      </div>
    </div>
  );
}
