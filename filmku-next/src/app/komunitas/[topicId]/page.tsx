import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { notFound } from 'next/navigation';
import ReplyForm from './ReplyForm';

export default async function TopikDetailPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const session = await getSession();

  const topic = await prisma.forumTopic.findUnique({
    where: { id: topicId },
    include: {
      posts: {
        include: { user: true }
      }
    }
  });

  if (!topic) notFound();

  return (
    <div style={{ padding: '2rem 4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '2rem' }}>{topic.title}</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
        {topic.posts.map((post, index) => (
          <div key={post.id} className="glass" style={{ padding: '2rem', borderRadius: '1rem', display: 'flex', gap: '2rem' }}>
            {/* User Info Sidebar */}
            <div style={{ width: '150px', textAlign: 'center', borderRight: '1px solid var(--glass-border)', paddingRight: '2rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent)', margin: '0 auto 1rem auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {post.user.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 600 }}>{post.user.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {post.user.role === 'ADMIN' ? 'Admin' : 'Member'}
              </div>
            </div>

            {/* Post Content */}
            <div style={{ flex: 1 }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                Baru saja
                {index === 0 && <span style={{ marginLeft: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>• OP</span>}
              </div>
              <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {post.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {session ? (
        <ReplyForm topicId={topic.id} />
      ) : (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', borderRadius: '1rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Anda harus login untuk membalas diskusi ini.</p>
          <a href="/login" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem', textDecoration: 'none' }}>Masuk</a>
        </div>
      )}
    </div>
  );
}
