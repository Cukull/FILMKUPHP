import { prisma } from '@/lib/prisma';
import CafeClient from './CafeClient';

export default async function CafePage() {
  const fnbItems = await prisma.fnBItem.findMany({
    where: { isAvailable: true },
    orderBy: { category: 'asc' }
  });

  return (
    <div style={{ padding: '2rem 4rem' }}>
      <CafeClient menu={fnbItems} />
    </div>
  );
}
