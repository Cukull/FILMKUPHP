'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthCookie, logout as removeAuthCookie, isDummyEmail } from '@/lib/auth';
import { redirect } from 'next/navigation';


export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Semua field harus diisi.' };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      if (isDummyEmail(email)) {
        return { error: '❌ Akun dummy ditolak! Harap gunakan Akun Google resmi asli (@gmail.com).' };
      }
      return { error: 'Email tidak ditemukan. Silakan masuk atau daftar menggunakan Akun Google.' };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { error: 'Password salah.' };

    await setAuthCookie(user.id, user.email, user.name || 'User');
    return { success: true };
  } catch (error) {
    console.error('Login Database Error:', error);
    return { error: 'Terjadi kesalahan pada server/database. Silakan coba lagi.' };
  }
}

export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) return { error: 'Semua field harus diisi.' };

  if (isDummyEmail(email)) {
    return { error: '❌ Email dummy ditolak! Harap gunakan Akun Google resmi asli (@gmail.com) yang valid.' };
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return { error: 'Email sudah terdaftar.' };

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    await setAuthCookie(user.id, user.email, user.name || 'User');
    return { success: true };
  } catch (error) {
    console.error('Register Database Error:', error);
    return { error: 'Terjadi kesalahan pada server/database. Silakan coba lagi.' };
  }
}

export async function googleAuthAction(email: string, name: string, avatarUrl?: string) {
  if (!email || isDummyEmail(email)) {
    return { error: '❌ Akses Ditolak: Harap gunakan Akun Google resmi asli (@gmail.com). Email dummy tidak diperbolehkan.' };
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Buat akun otomatis untuk pengguna Google yang valid
      const hashedPassword = await bcrypt.hash('google_oauth_secret_' + email, 10);
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          avatarUrl: avatarUrl || 'https://lh3.googleusercontent.com/a/default-user',
        }
      });
    }

    await setAuthCookie(user.id, user.email, user.name || 'User');
    return { success: true };
  } catch (error) {
    console.error('Google Auth Error:', error);
    return { error: 'Gagal masuk dengan Akun Google.' };
  }
}

export async function logoutAction() {
  await removeAuthCookie();
  redirect('/');
}

