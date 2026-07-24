import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Route ini berguna untuk menjaga database Supabase tetap aktif (tidak di-pause)
// Anda bisa memanggil route ini menggunakan layanan Cron Job gratis seperti cron-job.org atau UptimeRobot.
export async function GET() {
  try {
    // Lakukan query yang sangat ringan ke database
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', message: 'Database is awake and active!' });
  } catch (error) {
    console.error('Keep-alive error:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to reach database.' }, { status: 500 });
  }
}
