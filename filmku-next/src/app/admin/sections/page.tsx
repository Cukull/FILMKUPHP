import { prisma } from '@/lib/prisma';
import SectionsClient from './SectionsClient';
import { requireAdmin } from '@/lib/auth';

export const revalidate = 0; // Disable cache for admin pages

export default async function AdminSectionsPage() {
  await requireAdmin();

  const sections = await prisma.dashboardSection.findMany({
    orderBy: { order: 'asc' },
  });

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Kategori Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Kelola kategori/section film yang tampil di halaman beranda (Dashboard).
          </p>
        </div>
      </div>

      <SectionsClient initialData={sections} />
    </div>
  );
}
