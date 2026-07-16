import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RoleButton from './RoleButton';

export default async function AdminUsersList() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Kelola User</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Lihat data pengguna dan atur hak akses (Role) mereka.</p>
        </div>
      </div>

      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1.25rem 1rem' }}>NAMA</th>
              <th style={{ padding: '1.25rem 1rem' }}>EMAIL</th>
              <th style={{ padding: '1.25rem 1rem' }}>PASSWORD HASH</th>
              <th style={{ padding: '1.25rem 1rem' }}>ROLE</th>
              <th style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada pengguna</td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{user.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.75rem', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span title="Password dienkripsi secara aman menggunakan bcrypt. Tidak dapat dilihat langsung." style={{ cursor: 'help' }}>
                      {user.password}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {user.role === 'ADMIN' ? (
                      <span style={{ color: '#ef4444', fontWeight: 800 }}>ADMIN</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>USER</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    {/* Cegah user untuk merubah role dirinya sendiri agar tidak terkunci dari dashboard admin */}
                    {user.id !== session.userId ? (
                      <RoleButton userId={user.id} currentRole={user.role} />
                    ) : (
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>(Anda)</span>
                    )}
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
