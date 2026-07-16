import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { deleteMovie } from '@/actions/admin';
import DeleteButton from './DeleteButton'; // Client component for delete

export default async function AdminFilmList() {
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/login');
  }

  const movies = await prisma.movie.findMany({
    orderBy: { title: 'asc' }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Kelola Film</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Tambah, ubah, dan hapus daftar film yang tayang.</p>
        </div>
        <Link href="/admin/film/baru">
          <button className="btn-primary" style={{ padding: '0.5rem 1.5rem', fontWeight: 700 }}>
            + Tambah Film
          </button>
        </Link>
      </div>

      <div className="glass" style={{ borderRadius: '1rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '1.25rem 1rem' }}>JUDUL FILM</th>
              <th style={{ padding: '1.25rem 1rem' }}>GENRE</th>
              <th style={{ padding: '1.25rem 1rem' }}>SECTION</th>
              <th style={{ padding: '1.25rem 1rem' }}>DURASI</th>
              <th style={{ padding: '1.25rem 1rem' }}>RATING</th>
              <th style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {movies.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada film</td>
              </tr>
            ) : (
              movies.map(movie => (
                <tr key={movie.id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 700 }}>{movie.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {movie.genre?.split(',').map((g, i) => (
                      <span key={i} style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.2rem', marginRight: '0.25rem', marginBottom: '0.25rem', fontSize: '0.75rem' }}>
                        {g.trim()}
                      </span>
                    ))}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--primary)', fontSize: '0.8rem', maxWidth: '200px' }}>
                    {movie.sections}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {movie.durationMin ? `${Math.floor(movie.durationMin / 60)}h ${movie.durationMin % 60}m` : '-'}
                  </td>
                  <td style={{ padding: '1rem', color: '#fbbf24', fontWeight: 700 }}>
                    ★ {movie.rating || '-'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <Link href={`/admin/film/edit/${movie.id}`}>
                        <button style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '0.25rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer', width: '100%' }}>
                          Edit
                        </button>
                      </Link>
                      <DeleteButton id={movie.id} />
                    </div>
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
