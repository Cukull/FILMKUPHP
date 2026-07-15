'use client';

import { registerAction } from '@/actions/auth';
import Link from 'next/link';
import { useState } from 'react';

export default function Register() {
  const [error, setError] = useState('');

  const handleSubmit = async (formData: FormData) => {
    const res = await registerAction(formData);
    if (res?.error) setError(res.error);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass" style={{ padding: '3rem', borderRadius: '1rem', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Daftar Akun Baru</h2>
        
        {error && <div style={{ background: 'var(--accent)', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}

        <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nama Lengkap</label>
            <input type="text" name="name" required style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" name="email" required style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" name="password" required style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Daftar Sekarang</button>
        </form>
        
        <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Sudah punya akun? <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Masuk</Link>
        </p>
      </div>
    </div>
  );
}
