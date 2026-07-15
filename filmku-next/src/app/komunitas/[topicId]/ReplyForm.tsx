'use client';

import { createPost } from '@/actions/forum';
import { useState } from 'react';

export default function ReplyForm({ topicId }: { topicId: string }) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createPost(topicId, formData);
    
    if (res?.error) {
      setError(res.error);
    } else {
      // Clear form on success
      (e.target as HTMLFormElement).reset();
      setError('');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Tulis Balasan</h3>
      
      {error && <div style={{ background: 'var(--accent)', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <textarea 
          name="content" 
          rows={4}
          placeholder="Tuliskan balasan Anda di sini..."
          required 
          style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.5)', color: 'white', resize: 'vertical' }} 
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            type="submit" 
            className="btn-primary" 
            style={{ opacity: isSubmitting ? 0.7 : 1 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Balasan'}
          </button>
        </div>
      </form>
    </div>
  );
}
