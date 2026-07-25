import FilmForm from '../FilmForm';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import Link from 'next/link';

export const revalidate = 0; // Disable cache for admin pages

export default async function TambahFilmPage() {
  await requireAdmin();

  // Ambil daftar section/kategori dinamis
  const sectionsList = await prisma.dashboardSection.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Link href="/admin/film" style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ←
          </div>
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Tambah Film</h1>
      </div>
      <FilmForm sectionsList={sectionsList} />
    </div>
  );
}
