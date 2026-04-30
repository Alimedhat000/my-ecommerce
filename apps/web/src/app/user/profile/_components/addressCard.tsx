import { Trash2 } from 'lucide-react';
import { Address } from './addressesSection';

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  isEditing,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
}) {
  if (isEditing) return null;

  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-orange-300 hover:shadow-md">
      <div className="flex items-center justify-between gap-6">
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Country
            </p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {address.country}
            </p>
            <p className="mt-1 text-sm text-gray-600">{address.street}</p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
              State, City
            </p>
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {address.state}, {address.city}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium tracking-wide text-gray-500 uppercase">
              Postal Code
            </p>
            <p className="font-semibold text-gray-900">{address.postalCode}</p>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 self-start">
          <button
            onClick={onEdit}
            className="text-sm font-medium whitespace-nowrap text-orange-500 opacity-0 transition-all group-hover:opacity-100 hover:text-orange-600"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-sm font-medium whitespace-nowrap text-red-500 opacity-0 transition-all group-hover:opacity-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
