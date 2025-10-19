import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';

const addressSchema = z.object({
  street: z
    .string()
    .min(1, 'Street is required')
    .max(100, 'Street is too long'),
  city: z.string().min(1, 'City is required').max(50, 'City is too long'),
  state: z.string().min(1, 'State is required').max(50, 'State is too long'),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code is too long'),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(50, 'Country is too long'),
});

export type AddressFormData = z.infer<typeof addressSchema>;

interface Address extends AddressFormData {
  id: string;
}

export default function AddressForm({
  address,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  address?: Address;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

  return (
    <div className="rounded-xl border border-orange-300 bg-white p-5 shadow-md">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label
              htmlFor="street"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Street Address
            </label>
            <input
              id="street"
              type="text"
              {...register('street')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              placeholder="123 Main St"
            />
            {errors.street && (
              <p className="text-destructive mt-1 text-xs">
                {errors.street.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="city"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              City
            </label>
            <input
              id="city"
              type="text"
              {...register('city')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              placeholder="New York"
            />
            {errors.city && (
              <p className="text-destructive mt-1 text-xs">
                {errors.city.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="state"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              State
            </label>
            <input
              id="state"
              type="text"
              {...register('state')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              placeholder="NY"
            />
            {errors.state && (
              <p className="text-destructive mt-1 text-xs">
                {errors.state.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="postalCode"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Postal Code
            </label>
            <input
              id="postalCode"
              type="text"
              {...register('postalCode')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              placeholder="10001"
            />
            {errors.postalCode && (
              <p className="text-destructive mt-1 text-xs">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="country"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <input
              id="country"
              type="text"
              {...register('country')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              placeholder="United States"
            />
            {errors.country && (
              <p className="text-destructive mt-1 text-xs">
                {errors.country.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Saving...'
              : address
                ? 'Update Address'
                : 'Add Address'}
          </button>
        </div>
      </div>
    </div>
  );
}
