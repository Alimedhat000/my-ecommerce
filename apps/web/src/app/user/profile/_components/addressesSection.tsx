'use client';

import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { api } from '@/api/client';
import AddressCard from './addressCard';
import AddressForm, { AddressFormData } from './addressForm';

export interface Address extends AddressFormData {
  id: string;
}

export default function AddressesSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/addresses');
      if (!response.data.success) {
        throw new Error('Failed to load addresses');
      }
      setAddresses(response.data.addresses);
      setError(null);
    } catch (err) {
      setError('Failed to load addresses');
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleAddAddress = async (data: AddressFormData) => {
    try {
      setIsSubmitting(true);
      const response = await api.post('/user/addresses', data);
      if (response.data.success) {
        await fetchAddresses();
        setIsAdding(false);
      }
    } catch (err) {
      console.error('Error adding address:', err);
      // alert('Failed to add address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAddress = async (data: AddressFormData) => {
    if (!editingId) return;

    try {
      setIsSubmitting(true);
      const response = await api.patch(`/user/addresses/${editingId}`, data);
      if (response.data.success) {
        await fetchAddresses();
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error updating address:', err);
      // alert('Failed to update address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      setIsSubmitting(true);
      const response = await api.delete(`/user/addresses/${id}`);
      if (response.data.success) {
        await fetchAddresses();
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      // alert('Failed to delete address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startAdding = () => {
    setEditingId(null);
    setIsAdding(true);
  };

  const startEditing = (id: string) => {
    setIsAdding(false);
    setEditingId(id);
  };

  const cancelEditing = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  if (loading) {
    return (
      <section className="rounded-2xl bg-[#EDEDED] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Addresses</h2>
          <button className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white">
            <span className="text-lg leading-none">+</span> Add Address
          </button>
        </div>
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-gray-600">
          Loading addresses...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl bg-[#EDEDED] p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Addresses</h2>
          <button
            onClick={startAdding}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <span className="text-lg leading-none">+</span> Add Address
          </button>
        </div>
        <div className="text-destructive flex items-center justify-center rounded-xl border border-gray-200 bg-white p-8">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-[#EDEDED] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Addresses</h2>
        {!isAdding && (
          <button
            onClick={startAdding}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <span className="text-lg leading-none">+</span> Add Address
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isAdding && (
          <AddressForm
            onSubmit={handleAddAddress}
            onCancel={cancelEditing}
            isSubmitting={isSubmitting}
          />
        )}

        {addresses.length === 0 && !isAdding ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-gray-500">
            <span className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-5 w-5" />
              No addresses added yet
            </span>
          </div>
        ) : (
          addresses.map((addr) => (
            <div key={addr.id}>
              {editingId === addr.id ? (
                <AddressForm
                  address={addr}
                  onSubmit={handleUpdateAddress}
                  onCancel={cancelEditing}
                  isSubmitting={isSubmitting}
                />
              ) : (
                <AddressCard
                  address={addr}
                  onEdit={() => startEditing(addr.id)}
                  isEditing={editingId === addr.id}
                  onDelete={() => handleDeleteAddress(addr.id)}
                />
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
