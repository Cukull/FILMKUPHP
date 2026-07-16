'use client';

import { useState, useEffect } from 'react';

export default function WishlistButton({ movieId }: { movieId: string }) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('filmku_wishlist');
    if (stored) {
      try {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids) && ids.includes(movieId)) {
          setIsSaved(true);
        }
      } catch (e) {}
    }
  }, [movieId]);

  const toggleWishlist = () => {
    let ids: string[] = [];
    const stored = localStorage.getItem('filmku_wishlist');
    if (stored) {
      try {
        ids = JSON.parse(stored);
        if (!Array.isArray(ids)) ids = [];
      } catch (e) {
        ids = [];
      }
    }

    if (isSaved) {
      ids = ids.filter((id) => id !== movieId);
      setIsSaved(false);
    } else {
      if (!ids.includes(movieId)) {
        ids.push(movieId);
      }
      setIsSaved(true);
    }

    localStorage.setItem('filmku_wishlist', JSON.stringify(ids));
  };

  return (
    <button 
      onClick={toggleWishlist}
      aria-label="Tambah Wishlist" 
      style={{
        width: "44px", height: "44px", borderRadius: "50%",
        background: isSaved ? "rgba(229, 9, 20, 0.2)" : "rgba(255,255,255,0.1)", 
        border: `1px solid ${isSaved ? "var(--primary)" : "rgba(255,255,255,0.2)"}`,
        color: isSaved ? "var(--primary)" : "white", 
        fontSize: "1.1rem", cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center", transition: "all 0.2s ease",
      }}
    >
      {isSaved ? "❤️" : "🤍"}
    </button>
  );
}
