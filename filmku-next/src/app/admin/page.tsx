import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboard() {
  const session = await getSession();
  
  // Nanti harus dicek role = ADMIN. Untuk demo, jika login saja boleh lihat atau diabaikan
  if (!session) {
    redirect('/login');
  }

  // Cek apakah user Admin
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (user?.role !== 'ADMIN') {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2>Akses Ditolak</h2>
        <p>Anda bukan Administrator.</p>
      </div>
    );
  }

  const [movieCount, orderCount, totalRevenueResult] = await Promise.all([
    prisma.movie.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: 'SUCCESS' }
    })
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { user: true }
  });

  return (
    <div style={{ padding: '2rem 4rem' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>Dashboard Admin ⚙️</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Total Film</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{movieCount}</div>
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Total Transaksi</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{orderCount}</div>
        </div>
        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: 'var(--text-secondary)' }}>Total Pendapatan</div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>Rp {(totalRevenueResult._sum.totalAmount || 0).toLocaleString('id-ID')}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>Transaksi Terbaru</h2>
      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
              <th style={{ padding: '1rem' }}>ID Transaksi</th>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Tipe</th>
              <th style={{ padding: '1rem' }}>Total</th>
              <th style={{ padding: '1rem' }}>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada transaksi</td>
              </tr>
            ) : (
              recentOrders.map(order => (
                <tr key={order.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{order.id.slice(0,8)}...</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{order.user.name}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.2rem', fontSize: '0.8rem' }}>
                      {order.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>Rp {order.totalAmount.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(order.createdAt).toLocaleString('id-ID')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
