'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function KomunitasTabs({ topics, hasSession }: { topics: any[], hasSession: boolean }) {
  const [activeTab, setActiveTab] = useState<'artikel' | 'forum'>('artikel');

  return (
    <>
      {/* Tabs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <button 
            onClick={() => setActiveTab('artikel')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
              fontWeight: 600, color: activeTab === 'artikel' ? 'var(--text-primary)' : 'var(--text-secondary)',
              position: 'relative', padding: '0.5rem 0'
            }}
          >
            📄 Artikel & Fakta Film
            {activeTab === 'artikel' && (
              <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', borderRadius: '3px' }} />
            )}
          </button>
          
          <button 
            onClick={() => setActiveTab('forum')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem',
              fontWeight: 600, color: activeTab === 'forum' ? 'var(--text-primary)' : 'var(--text-secondary)',
              position: 'relative', padding: '0.5rem 0'
            }}
          >
            💬 Forum Diskusi
            {activeTab === 'forum' && (
              <div style={{ position: 'absolute', bottom: '-17px', left: 0, width: '100%', height: '3px', background: 'var(--primary)', borderRadius: '3px' }} />
            )}
          </button>
        </div>

        {activeTab === 'artikel' ? (
          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ Tulis Artikel</button>
        ) : (
          hasSession ? (
            <Link href="/komunitas/baru">
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>+ Mulai Diskusi Baru</button>
            </Link>
          ) : (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Login untuk diskusi</div>
          )
        )}
      </div>

      {/* Tabs Content */}
      <div style={{ minHeight: '400px' }}>
        {activeTab === 'artikel' && (
          <div className="glass" style={{ borderRadius: '1rem', display: 'flex', overflow: 'hidden' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <img 
                src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop" 
                alt="Interstellar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge" style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'var(--primary)' }}>FEATURED</span>
            </div>
            <div style={{ flex: 1, padding: '3rem' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                <span style={{ color: 'var(--accent)' }}>ARTIKEL PILIHAN</span>
                <span style={{ color: 'var(--text-secondary)' }}>09 JUL 2026</span>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.3 }}>
                5 Teori Fisika yang Disinggung dalam Film Interstellar, Mindblowing!
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Sutradara Christopher Nolan dikenal sangat terobsesi dengan akurasi sains. Dalam pembuatan Interstellar, ia bahkan menggandeng fisikawan teoretis pemenang Nobel, Kip Thorne. Hasilnya? Film ini sukses memvisualisasikan...
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>A</div>
                  <span style={{ fontWeight: 600 }}>Asep</span>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}>
                  Baca Selengkapnya →
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forum' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topics.length === 0 ? (
              <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>💬</span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Forum Masih Sepi</h3>
                <p>Jadilah yang pertama memulai diskusi seru tentang film favoritmu!</p>
              </div>
            ) : (
              topics.map(topic => (
                <Link href={`/komunitas/${topic.id}`} key={topic.id} style={{ textDecoration: 'none' }}>
                  <div className="glass" style={{ padding: '1.5rem 2rem', borderRadius: '1rem', transition: 'all 0.2s', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{topic.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          Mulai oleh <span style={{ color: 'var(--accent)' }}>{topic.posts[0]?.user.name || 'Anonim'}</span> • {new Date(topic.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem', borderRadius: '2rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>💬</span>
                        <span style={{ fontWeight: 600, color: 'white' }}>{topic.posts.length} balasan</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
