import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import KomunitasTabs from './KomunitasTabs';

export default async function KomunitasPage() {
  const session = await getSession();
  const topics = await prisma.forumTopic.findMany({
    include: {
      posts: {
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="page-transition">
      {/* Hero Section */}
      <div style={{ padding: '6rem 4rem 4rem', textAlign: 'center', background: 'radial-gradient(ellipse at top, rgba(229,9,20,0.15), transparent 70%)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)', padding: '0.25rem 1rem', borderRadius: '2rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
          <span>👥</span> KOMUNITAS
        </div>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem' }}>
          Cine-Community
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
          Ruang para pecinta film — baca artikel eksklusif, bagikan pendapat, dan diskusikan film favoritmu bersama komunitas.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', borderTop: '1px solid var(--glass-border)', paddingTop: '3rem', maxWidth: '400px', margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>1</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginTop: '0.5rem' }}>ARTIKEL</div>
          </div>
          <div style={{ width: '1px', background: 'var(--glass-border)' }}></div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{topics.length}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginTop: '0.5rem' }}>DISKUSI</div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div style={{ padding: '2rem 4rem 6rem', maxWidth: '1200px', margin: '0 auto' }}>
        <KomunitasTabs topics={topics} hasSession={!!session} />
      </div>
    </div>
  );
}
