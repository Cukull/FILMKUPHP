import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

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
    <div style={{ padding: '2rem 4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Forum Komunitas 🗣️</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Diskusikan film, teori, dan ulasan bersama pecinta film lainnya.</p>
        </div>
        {session ? (
          <Link href="/komunitas/baru">
            <button className="btn-primary">+ Buat Topik Baru</button>
          </Link>
        ) : (
          <div style={{ color: 'var(--text-secondary)' }}>Silakan login untuk membuat topik.</div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {topics.length === 0 ? (
          <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem', color: 'var(--text-secondary)' }}>
            Belum ada topik diskusi. Jadilah yang pertama!
          </div>
        ) : (
          topics.map(topic => (
            <Link href={`/komunitas/${topic.id}`} key={topic.id} style={{ textDecoration: 'none' }}>
              <div className="glass" style={{ padding: '1.5rem 2rem', borderRadius: '1rem', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{topic.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Mulai oleh <span style={{ color: 'var(--accent)' }}>{topic.posts[0]?.user.name || 'Anonim'}</span> • {new Date(topic.createdAt).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                    <span style={{ fontSize: '1.2rem' }}>💬</span>
                    <span style={{ fontWeight: 600, color: 'white' }}>{topic.posts.length} balasan</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
