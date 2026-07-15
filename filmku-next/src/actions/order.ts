'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function createTicketOrder(showtimeId: string, seatNumbers: string[], totalAmount: number) {
  const session = await getSession();
  if (!session) return { error: 'Anda belum login.' };

  try {
    // Jalankan transaksi database agar aman (mencegah double booking)
    const order = await prisma.$transaction(async (tx) => {
      // 1. Cek apakah kursi sudah dipesan orang lain
      const existingSeats = await tx.seat.findMany({
        where: { showtimeId, seatNumber: { in: seatNumbers }, status: 'BOOKED' }
      });
      if (existingSeats.length > 0) {
        throw new Error('Salah satu kursi yang Anda pilih baru saja dipesan orang lain.');
      }

      // 2. Buat Data Pesanan
      const newOrder = await tx.order.create({
        data: {
          userId: session.userId,
          totalAmount,
          status: 'SUCCESS', // Untuk demo langsung anggap sukses
          type: 'TICKET_ONLY'
        }
      });

      // 3. Simpan dan kunci kursi
      const seatPromises = seatNumbers.map(seatNumber => 
        tx.seat.create({
          data: {
            showtimeId,
            seatNumber,
            status: 'BOOKED',
            userId: session.userId,
            orderId: newOrder.id
          }
        })
      );
      await Promise.all(seatPromises);

      return newOrder;
    });

    return { success: true, orderId: order.id };
  } catch (error: any) {
    return { error: error.message || 'Terjadi kesalahan saat memproses pesanan.' };
  }
}

export async function createFnbOrder(items: { name: string, qty: number, price: number }[], totalAmount: number) {
  const session = await getSession();
  if (!session) return { error: 'Anda belum login.' };

  try {
    const order = await prisma.order.create({
      data: {
        userId: session.userId,
        totalAmount,
        status: 'SUCCESS', // Untuk demo langsung anggap sukses
        type: 'FNB_ONLY'
      }
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    return { error: 'Gagal membuat pesanan makanan.' };
  }
}
