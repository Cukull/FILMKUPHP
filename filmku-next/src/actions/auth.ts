'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { setAuthCookie, logout as removeAuthCookie } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Semua field harus diisi.' };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: 'Email tidak ditemukan.' };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: 'Password salah.' };

  await setAuthCookie(user.id, user.email, user.name || 'User');
  return { success: true };
}

export async function registerAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) return { error: 'Semua field harus diisi.' };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: 'Email sudah terdaftar.' };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword }
  });

  await setAuthCookie(user.id, user.email, user.name || 'User');
  return { success: true };
}

export async function logoutAction() {
  await removeAuthCookie();
  redirect('/');
}
