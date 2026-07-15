'use client';

import { createTopic } from '@/actions/forum';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function BuatTopikPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createTopic(formData);
    
    if (res?.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else if (res?.topicId) {
      router.push(`/komunitas/${res.topicId}`);
    }
  };

  return (
    <div style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'center' }}>
      <div className="glass" style={{ padding: '3rem', borderRadius: '1rem', width: '100%', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem' }}>Buat Topik Baru</h1>
        
        {error && <div style={{ background: 'var(--accent)', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Judul Topik</label>
            <input 
              type="text" 
              name="title" 
              placeholder="Contoh: Teori ending film Inception..."
              required 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white' }} 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Isi Diskusi</label>
            <textarea 
              name="content" 
              rows={6}
              placeholder="Tuliskan pendapat atau pertanyaanmu di sini..."
              required 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', resize: 'vertical' }} 
            />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              onClick={() => router.back()}
              className="btn-primary" 
              style={{ background: 'transparent', border: '1px solid var(--glass-border)', flex: 1 }}
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ flex: 2, opacity: isSubmitting ? 0.7 : 1 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Posting Topik'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
