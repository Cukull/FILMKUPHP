import { prisma } from '@/lib/prisma';
import FilmForm from '../../FilmForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EditFilmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const movie = await prisma.movie.findUnique({
    where: { id }
  });

  if (!movie) {
    notFound();
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/film" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ←
          </div>
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Edit Film</h1>
      </div>
      <FilmForm initialData={movie} />
    </div>
  );
}
