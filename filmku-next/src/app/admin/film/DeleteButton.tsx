'use client';

import { useTransition } from 'react';
import { deleteMovie } from '@/actions/admin';

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm('Yakin ingin menghapus film ini? Semua jadwal tayang yang terkait akan ikut terhapus.')) {
      startTransition(async () => {
        await deleteMovie(id);
      });
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      style={{ 
        background: 'rgba(229, 9, 20, 0.1)', 
        color: 'var(--primary)', 
        border: '1px solid rgba(229,9,20,0.3)', 
        borderRadius: '0.25rem', 
        padding: '0.25rem 0.75rem', 
        fontSize: '0.75rem', 
        cursor: isPending ? 'wait' : 'pointer',
        width: '100%',
        opacity: isPending ? 0.5 : 1
      }}
    >
      {isPending ? 'Hapus...' : 'Hapus'}
    </button>
  );
}
