'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMovieComments, postMovieComment } from '@/actions/comments';

interface CommentUser {
  id: string;
  name?: string | null;
  email: string;
  avatarUrl?: string | null;
}

interface MovieCommentItem {
  id: string;
  content: string;
  rating: number;
  likes: number;
  createdAt: Date | string;
  user: CommentUser;
  replies?: MovieCommentItem[];
}

interface MovieCommentsProps {
  movieId: string;
  isLoggedIn: boolean;
  currentUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export default function MovieComments({ movieId, isLoggedIn, currentUser }: MovieCommentsProps) {
  const [comments, setComments] = useState<MovieCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'comments' | 'reviews'>('comments');
  const [sortOrder, setSortOrder] = useState<'best' | 'top' | 'latest'>('latest');

  // Reply state
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState('');

  // Load comments
  useEffect(() => {
    let isMounted = true;
    getMovieComments(movieId).then((data) => {
      if (isMounted) {
        setComments(data as MovieCommentItem[]);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [movieId]);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    setErrorMsg('');

    const res = await postMovieComment(movieId, newComment, rating);
    if (res?.error) {
      setErrorMsg(res.error);
      setSubmitting(false);
    } else if (res?.success && res.comment) {
      // Add immediately to local state for instant feedback
      const addedItem: MovieCommentItem = {
        id: res.comment.id,
        content: res.comment.content,
        rating: res.comment.rating,
        likes: res.comment.likes,
        createdAt: new Date(),
        user: {
          id: currentUser?.id || 'me',
          name: currentUser?.name || 'Anda',
          email: currentUser?.email || 'user@gmail.com',
        },
        replies: [],
      };
      setComments((prev) => [addedItem, ...prev]);
      setNewComment('');
      setRating(10);
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplySubmitting(true);
    setReplyError('');

    const res = await postMovieComment(movieId, replyText, 10, parentId);
    if (res?.error) {
      setReplyError(res.error);
      setReplySubmitting(false);
    } else if (res?.success && res.comment) {
      const addedReply: MovieCommentItem = {
        id: res.comment.id,
        content: res.comment.content,
        rating: 10,
        likes: 0,
        createdAt: new Date(),
        user: {
          id: currentUser?.id || 'me',
          name: currentUser?.name || 'Anda',
          email: currentUser?.email || 'user@gmail.com',
        },
      };

      setComments((prev) =>
        prev.map((item) => {
          if (item.id === parentId) {
            return {
              ...item,
              replies: [...(item.replies || []), addedReply],
            };
          }
          return item;
        })
      );
      setReplyText('');
      setActiveReplyId(null);
      setReplySubmitting(false);
    }
  };

  // Helper time ago
  const getTimeAgo = (dateVal: Date | string) => {
    const d = new Date(dateVal);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Baru saja';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  // Default fallback sample comments if empty so the movie review section is never lonely
  const displayComments: MovieCommentItem[] = comments.length > 0 ? comments : [
    {
      id: 'default-1',
      content: 'Ciri khas film sinema premium yang selalu punya scene ikonis bikin emosi penonton terbawa suasana!',
      rating: 10,
      likes: 19,
      createdAt: new Date(Date.now() - 86400000 * 2),
      user: {
        id: 'usr-1',
        name: 'Mighty Bonyon',
        email: 'bonyon.official@gmail.com',
      },
      replies: [
        {
          id: 'rep-1',
          content: 'Setuju banget bro! Kualitas audio & visualnya juara teater abis!',
          rating: 10,
          likes: 5,
          createdAt: new Date(Date.now() - 86400000),
          user: {
            id: 'usr-3',
            name: 'FILMKU Theater VIP',
            email: 'admin.vip@gmail.com',
          }
        }
      ]
    },
    {
      id: 'default-2',
      content: 'Pas scene klimaks soundtrack-nya dapet banget, kualitas gambarnya bening HD 1080p!',
      rating: 9,
      likes: 11,
      createdAt: new Date(Date.now() - 86400000),
      user: {
        id: 'usr-2',
        name: 'Sternritter',
        email: 'asmodeuss@gmail.com',
      },
      replies: []
    }
  ];

  const totalCount = displayComments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);
  const avgRating = (
    displayComments.reduce((acc, c) => acc + c.rating, 0) / displayComments.length
  ).toFixed(1);

  return (
    <div
      style={{
        marginTop: '3rem',
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '2rem',
        color: '#fff',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/* ── TOP BAR (persis Screenshot 1 IDLIX) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: '1.2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Comments{' '}
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
              {displayComments.length} • {totalCount} with replies
            </span>
          </h3>

          {/* Star Rating Average */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(234, 179, 8, 0.15)',
              border: '1px solid rgba(234, 179, 8, 0.35)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#eab308',
            }}
          >
            <span>★ {avgRating}/10</span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>({displayComments.length})</span>
          </div>
        </div>

        {/* Filters & Sorting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2px', display: 'flex' }}>
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              style={{
                background: activeTab === 'comments' ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '16px',
                cursor: 'pointer',
              }}
            >
              Comments
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reviews')}
              style={{
                background: activeTab === 'reviews' ? 'rgba(255,255,255,0.15)' : 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '5px 12px',
                borderRadius: '16px',
                cursor: 'pointer',
              }}
            >
              Reviews
            </button>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '20px', padding: '2px', display: 'flex' }}>
            {(['best', 'top', 'latest'] as const).map((order) => (
              <button
                key={order}
                type="button"
                onClick={() => setSortOrder(order)}
                style={{
                  background: sortOrder === order ? '#222' : 'transparent',
                  border: 'none',
                  color: sortOrder === order ? '#fff' : 'rgba(255,255,255,0.5)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  padding: '5px 10px',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                }}
              >
                {order}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BANNER "Sign in to post a comment" JIKA BELUM LOGIN (persis Screenshot 1) ── */}
      {!isLoggedIn ? (
        <div
          style={{
            background: '#161616',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center',
            fontSize: '0.92rem',
            color: 'rgba(255,255,255,0.7)',
            marginBottom: '2rem',
          }}
        >
          <Link
            href="/auth"
            style={{
              color: '#e50914',
              fontWeight: 700,
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            Sign in
          </Link>{' '}
          to post a comment
        </div>
      ) : (
        /* ── FORM INPUT KOMENTAR JIKA SUDAH LOGIN ── */
        <form onSubmit={handlePost} style={{ marginBottom: '2.5rem' }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(229,9,20,0.15)',
                border: '1px solid rgba(229,9,20,0.4)',
                color: '#ff8888',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '1rem',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <div
            style={{
              background: '#161616',
              border: '1.5px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '1.2rem',
              transition: 'border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#e50914',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    color: '#fff',
                  }}
                >
                  {(currentUser?.name || currentUser?.email || 'U')[0].toUpperCase()}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                  {currentUser?.name || currentUser?.email?.split('@')[0]}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  @{currentUser?.email?.split('@')[0]}
                </span>
              </div>

              {/* Rating Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)' }}>Rating:</span>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  style={{
                    background: '#222',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#eab308',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                    <option key={num} value={num}>
                      ★ {num}/10
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar atau ulasan Anda tentang film ini..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '0.92rem',
                outline: 'none',
                resize: 'vertical',
                minHeight: '60px',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.8rem' }}>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                style={{
                  background: '#e50914',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.55rem 1.3rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: submitting || !newComment.trim() ? 'not-allowed' : 'pointer',
                  opacity: submitting || !newComment.trim() ? 0.6 : 1,
                  transition: 'background 0.2s',
                }}
              >
                {submitting ? 'Mengirim...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── CLICKBAIT GAMING AD BANNER (persis "BISA DAPET UANG - klik disini") ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          margin: '2rem 0 2.8rem',
        }}
      >
        <a
          href="https://dischargeconceiteffort.com/sq3hxbttr?key=d3993ddc4df812b0b6f5bdbf290cfd4f"

          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'relative',
            background: 'radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.45) 0%, rgba(18, 11, 28, 0.98) 75%)',
            border: '2.5px solid #8b5cf6',
            borderRadius: '24px',
            padding: '2rem 2.8rem',
            textAlign: 'center',
            textDecoration: 'none',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 45px rgba(0,0,0,0.85), 0 0 35px rgba(139, 92, 246, 0.4)',
            transition: 'all 0.25s ease',
            overflow: 'hidden',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.03) translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 25px 55px rgba(0,0,0,0.95), 0 0 50px rgba(168, 85, 247, 0.7)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = '0 20px 45px rgba(0,0,0,0.85), 0 0 35px rgba(139, 92, 246, 0.4)';
          }}
          title="Klik di sini untuk dapet reward!"
        >
          {/* Top/Side Cute Cartoon Floating Characters */}
          <div style={{
            position: 'absolute', top: '14px', left: '18px', fontSize: '1.6rem',
            filter: 'drop-shadow(0 2px 6px rgba(139, 92, 246, 0.8))'
          }}>👾</div>
          <div style={{
            position: 'absolute', top: '14px', right: '18px', fontSize: '1.6rem',
            filter: 'drop-shadow(0 2px 6px rgba(139, 92, 246, 0.8))'
          }}>🎮</div>
          <div style={{
            position: 'absolute', bottom: '16px', left: '22px', fontSize: '1.5rem',
            filter: 'drop-shadow(0 2px 6px rgba(234, 179, 8, 0.8))'
          }}>🎁</div>
          <div style={{
            position: 'absolute', bottom: '16px', right: '22px', fontSize: '1.5rem',
            filter: 'drop-shadow(0 2px 6px rgba(34, 197, 94, 0.8))'
          }}>💰</div>

          {/* Bold 3D Stacked Purple Typography persis gambar */}
          <div style={{
            fontFamily: "'Impact', 'Arial Black', sans-serif",
            fontSize: '2.5rem',
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: '1.5px',
            color: '#c084fc',
            textTransform: 'uppercase',
            textShadow: '0 3px 0 #6b21a8, 0 8px 20px rgba(0,0,0,0.9)',
          }}>
            BISA<br />
            DAPET<br />
            UANG
          </div>

          {/* Lower Pill Click Here Badge */}
          <div style={{
            marginTop: '0.4rem',
            background: 'linear-gradient(90deg, #9333ea, #7c3aed)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.9rem',
            padding: '0.5rem 1.6rem',
            borderRadius: '50px',
            letterSpacing: '1px',
            textTransform: 'lowercase',
            boxShadow: '0 4px 15px rgba(147, 51, 234, 0.7)',
          }}>
            klik disini
          </div>
        </a>
      </div>

      {/* ── DAFTAR KOMENTAR & BALASAN (NESTED REPLIES) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        {displayComments.map((item) => {
          const initial = (item.user?.name || item.user?.email || 'U')[0].toUpperCase();
          const username = (item.user?.email || 'user').split('@')[0];
          const isReplying = activeReplyId === item.id;

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                gap: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                paddingBottom: '1.5rem',
              }}
            >
              {/* User Avatar Circle */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: item.user?.email?.includes('bonyon')
                    ? '#e50914'
                    : item.user?.email?.includes('asmodeus')
                    ? '#3b82f6'
                    : '#a855f7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: '#fff',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                }}
              >
                {initial}
              </div>

              {/* Comment Content & Nested Replies */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fff' }}>
                    {item.user?.name || username}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>@{username}</span>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>•</span>
                  <div
                    style={{
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      padding: '1px 7px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#eab308',
                    }}
                  >
                    ★ {item.rating}/10
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginLeft: '4px' }}>
                    {getTimeAgo(item.createdAt)}
                  </span>
                </div>

                <p style={{ fontSize: '0.94rem', color: 'rgba(255,255,255,0.88)', lineHeight: 1.5, margin: '0 0 0.8rem' }}>
                  {item.content}
                </p>

                {/* Like & Reply Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: isReplying ? '1rem' : '0' }}>
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    👍 <span>{item.likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLoggedIn) {
                        window.location.href = '/auth';
                        return;
                      }
                      setActiveReplyId(isReplying ? null : item.id);
                      setReplyText('');
                      setReplyError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e50914',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    💬 {isReplying ? 'Batal Balas' : 'Reply'}
                  </button>
                </div>

                {/* ── FORM BALAS KOMENTAR (MUNCUL KETIKA KLIK REPLY) ── */}
                {isReplying && (
                  <form
                    onSubmit={(e) => handleReplySubmit(item.id, e)}
                    style={{
                      marginTop: '0.8rem',
                      background: '#141414',
                      border: '1px solid rgba(229, 9, 20, 0.4)',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}
                  >
                    {replyError && (
                      <div style={{ color: '#ff8888', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                        ⚠️ {replyError}
                      </div>
                    )}
                    <textarea
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Balas komentar @${username}...`}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.88rem',
                        outline: 'none',
                        resize: 'vertical',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', marginTop: '0.6rem' }}>
                      <button
                        type="button"
                        onClick={() => setActiveReplyId(null)}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.4rem 0.9rem',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={replySubmitting || !replyText.trim()}
                        style={{
                          background: '#e50914',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '0.4rem 1rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: replySubmitting || !replyText.trim() ? 'not-allowed' : 'pointer',
                          opacity: replySubmitting || !replyText.trim() ? 0.6 : 1,
                        }}
                      >
                        {replySubmitting ? 'Mengirim...' : 'Kirim Balasan'}
                      </button>
                    </div>
                  </form>
                )}

                {/* ── DAFTAR SUB-KOMENTAR / REPLIES YANG SUDAH ADA ── */}
                {item.replies && item.replies.length > 0 && (
                  <div
                    style={{
                      marginTop: '1.2rem',
                      paddingLeft: '1.2rem',
                      borderLeft: '2px solid rgba(229,9,20,0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    {item.replies.map((reply) => {
                      const repInitial = (reply.user?.name || reply.user?.email || 'U')[0].toUpperCase();
                      const repUsername = (reply.user?.email || 'user').split('@')[0];

                      return (
                        <div key={reply.id} style={{ display: 'flex', gap: '0.8rem', alignItems: 'flex-start' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '50%',
                              background: '#22c55e',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              color: '#fff',
                              flexShrink: 0,
                            }}
                          >
                            {repInitial}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                                {reply.user?.name || repUsername}
                              </span>
                              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>@{repUsername}</span>
                              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>•</span>
                              <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
                                {getTimeAgo(reply.createdAt)}
                              </span>
                            </div>

                            <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.45, margin: 0 }}>
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
