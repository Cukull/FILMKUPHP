import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const secretKey = process.env.JWT_SECRET || 'secret-rahasia-filmku-2026';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function setAuthCookie(userId: string, email: string, name: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId, email, name, expires });

  (await cookies()).set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  try {
    const payload = await decrypt(session);
    
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
      select: { role: true }
    });
    
    if (!user) return null; // user deleted or not found
    
    return { ...payload, role: user.role };
  } catch (err) {
    return null;
  }
}

export async function logout() {
  (await cookies()).set('session', '', { expires: new Date(0) });
}

export async function getAuthUser() {
  const session = await getSession();
  if (!session || !session.userId) return null;
  return {
    id: session.userId as string,
    email: session.email as string,
    name: session.name as string,
    role: session.role,
  };
}

export function isDummyEmail(email: string): boolean {
  if (!email || !email.includes('@')) return true;
  const lower = email.toLowerCase().trim();
  const domain = lower.split('@')[1] || '';
  const local = lower.split('@')[0] || '';

  // Kata/Domain dummy yang pasti ditolak
  const dummyDomains = [
    'mailinator.com', 'tempmail.com', 'guerrillamail.com', '10minutemail.com',
    'yopmail.com', 'trashmail.com', 'sharklasers.com', 'example.com', 'test.com',
    'dummy.com', 'fake.com', 'mail.com', 'email.com'
  ];
  if (dummyDomains.includes(domain)) return true;

  // Izinkan gmail.com, yahoo.com, outlook.com, hotmail.com, icloud.com, serta ac.id, sch.id, co.id
  const validProviders = [
    'gmail.com', 'yahoo.com', 'yahoo.co.id', 'outlook.com', 'hotmail.com', 
    'icloud.com', 'live.com', 'googlemail.com'
  ];
  if (!validProviders.includes(domain) && !domain.endsWith('.id')) {
    return true;
  }

  // Tolak local username asal-asalan
  if (['test', 'testing', 'dummy', 'fake', 'admin123', 'user123', 'email123'].includes(local)) {
    return true;
  }

  return false;
}

