'use client';

import { useAuth } from '@/contexts/authContext';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const { logout } = useAuth();
  const handleLogout = async () => {
    logout();
  };

  return (
    <button onClick={handleLogout} title="Logout">
      <LogOut />
    </button>
  );
}
