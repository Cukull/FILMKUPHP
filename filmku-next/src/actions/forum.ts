'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createTopic(formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Anda harus login untuk membuat topik.' };

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  if (!title || !content) return { error: 'Judul dan isi tidak boleh kosong.' };

  try {
    const topic = await prisma.forumTopic.create({
      data: {
        title,
        posts: {
          create: {
            content,
            userId: session.userId
          }
        }
      }
    });
    
    revalidatePath('/komunitas');
    return { success: true, topicId: topic.id };
  } catch (error) {
    return { error: 'Gagal membuat topik.' };
  }
}

export async function createPost(topicId: string, formData: FormData) {
  const session = await getSession();
  if (!session) return { error: 'Anda harus login untuk membalas.' };

  const content = formData.get('content') as string;
  if (!content) return { error: 'Komentar tidak boleh kosong.' };

  try {
    await prisma.forumPost.create({
      data: {
        content,
        topicId,
        userId: session.userId
      }
    });

    revalidatePath(`/komunitas/${topicId}`);
    return { success: true };
  } catch (error) {
    return { error: 'Gagal membalas topik.' };
  }
}
