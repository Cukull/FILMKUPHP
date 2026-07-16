'use client';

import { useTransition } from 'react';
import { updateUserRole } from '@/actions/admin';

export default function RoleButton({ userId, currentRole }: { userId: string, currentRole: 'ADMIN' | 'USER' }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    if (confirm(`Yakin ingin mengubah role user ini menjadi ${newRole}?`)) {
      startTransition(async () => {
        await updateUserRole(userId, newRole);
      });
    }
  };

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      style={{ 
        background: currentRole === 'ADMIN' ? 'rgba(229, 9, 20, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
        color: currentRole === 'ADMIN' ? '#ef4444' : '#10b981', 
        border: `1px solid ${currentRole === 'ADMIN' ? 'rgba(229,9,20,0.3)' : 'rgba(16,185,129,0.3)'}`, 
        borderRadius: '0.25rem', 
        padding: '0.25rem 0.75rem', 
        fontSize: '0.75rem', 
        cursor: isPending ? 'wait' : 'pointer',
        opacity: isPending ? 0.5 : 1
      }}
    >
      {isPending ? 'Memproses...' : (currentRole === 'ADMIN' ? 'Jadikan USER' : 'Jadikan ADMIN')}
    </button>
  );
}
