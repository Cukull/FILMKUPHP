import { prisma } from '@/lib/prisma';
import FilmForm from '../../FilmForm';
import ShowtimeManager from '../../ShowtimeManager';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { showtimes: true },
  });

  if (!movie) {
    notFound();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', maxWidth: '900px', margin: '0 auto 2rem' }}>
        <Link href="/admin/film" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ←
          </div>
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Edit Film</h1>
      </div>

      <FilmForm initialData={movie} />

      {/* Showtime Manager Section */}
      <div style={{ maxWidth: '900px', margin: '2rem auto 0', padding: '2.5rem', background: 'rgba(12, 12, 22, 0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}>
        <ShowtimeManager movieId={movie.id} showtimes={movie.showtimes} />
      </div>
    </div>
  );
}
