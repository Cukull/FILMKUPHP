import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminFnBList() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') redirect('/login');

  const items = await prisma.fnBItem.findMany({
    orderBy: { category: 'asc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Kelola Menu F&B</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tambah, ubah, dan hapus menu makanan/minuman.</p>
        </div>
        <Link href="/admin/fnb/baru">
          <button className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontWeight: 700 }}>
            + Tambah Menu
          </button>
        </Link>
      </div>

      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1.25rem 1rem' }}>NAMA MENU</th>
              <th style={{ padding: '1.25rem 1rem' }}>KATEGORI</th>
              <th style={{ padding: '1.25rem 1rem' }}>HARGA</th>
              <th style={{ padding: '1.25rem 1rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada menu F&B</td>
              </tr>
            ) : (
              items.map(item => (
                <tr key={item.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{item.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{item.category}</td>
                  <td style={{ padding: '1rem', color: 'var(--primary)' }}>Rp {item.price.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '1rem' }}>
                    {item.isAvailable ? <span style={{ color: '#10b981' }}>Tersedia</span> : <span style={{ color: '#ef4444' }}>Habis</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
