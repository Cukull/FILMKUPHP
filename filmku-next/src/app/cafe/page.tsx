'use client';

import { useState } from 'react';
import Image from 'next/image';

type CafeItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'Snack' | 'Minuman' | 'Makanan Berat';
};

const MENU: CafeItem[] = [
  { id: '1', name: 'Popcorn Caramel Jumbo', price: 65000, category: 'Snack', image: 'https://via.placeholder.com/150/e50914/FFFFFF?text=Popcorn+Caramel' },
  { id: '2', name: 'Popcorn Asin Medium', price: 45000, category: 'Snack', image: 'https://via.placeholder.com/150/e50914/FFFFFF?text=Popcorn+Asin' },
  { id: '3', name: 'Coca-Cola Large', price: 25000, category: 'Minuman', image: 'https://via.placeholder.com/150/000000/FFFFFF?text=Coca+Cola' },
  { id: '4', name: 'Lemon Tea Float', price: 30000, category: 'Minuman', image: 'https://via.placeholder.com/150/eab308/000000?text=Lemon+Tea' },
  { id: '5', name: 'Hotdog Sosis Bakar', price: 40000, category: 'Makanan Berat', image: 'https://via.placeholder.com/150/d97706/FFFFFF?text=Hotdog' },
  { id: '6', name: 'Nachos Cheese', price: 55000, category: 'Snack', image: 'https://via.placeholder.com/150/f59e0b/000000?text=Nachos' },
];

export default function CafePage() {
  const [cart, setCart] = useState<{ item: CafeItem, qty: number }[]>([]);

  const addToCart = (item: CafeItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map(i => i.item.id === itemId ? { ...i, qty: i.qty - 1 } : i);
      }
      return prev.filter(i => i.item.id !== itemId);
    });
  };

  const total = cart.reduce((sum, cartItem) => sum + (cartItem.item.price * cartItem.qty), 0);

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Keranjang masih kosong!');
    
    setIsProcessing(true);
    const { createFnbOrder } = await import('@/actions/order');
    const items = cart.map(c => ({ name: c.item.name, qty: c.qty, price: c.item.price }));
    const res = await createFnbOrder(items, total);
    setIsProcessing(false);

    if (res?.error) {
      alert(res.error);
    } else {
      alert(`Pesanan makanan berhasil dikirim! ID Pesanan: ${res?.orderId}. Total: Rp ${total.toLocaleString('id-ID')}`);
      setCart([]);
    }
  };

  return (
    <div style={{ padding: '2rem 4rem', display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
      
      {/* Menu Kiri */}
      <div style={{ flex: 2, minWidth: '300px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>FILMKU Cafe 🍿</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem' }}>
          Pesan camilan favoritmu langsung dari kursi atau ambil di meja kasir.
        </p>

        <div className="movie-grid" style={{ padding: 0 }}>
          {MENU.map(item => (
            <div key={item.id} className="glass" style={{ padding: '1rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <img src={item.image} alt={item.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }} />
              <div>
                <h4 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{item.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.category}</p>
                <div style={{ color: 'var(--accent)', fontWeight: 'bold', marginTop: '0.5rem' }}>Rp {item.price.toLocaleString('id-ID')}</div>
              </div>
              <button 
                onClick={() => addToCart(item)}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.5rem' }}
              >
                + Tambah
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Kanan */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', flex: 1, minWidth: '300px', height: 'fit-content', position: 'sticky', top: '100px' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Keranjang</h3>
        
        {cart.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>Belum ada pesanan.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {cart.map(c => (
              <div key={c.item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{c.item.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Rp {c.item.price.toLocaleString('id-ID')}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(0,0,0,0.5)', padding: '0.2rem 0.5rem', borderRadius: '0.5rem' }}>
                  <button onClick={() => removeFromCart(c.item.id)} style={{ color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>-</button>
                  <span>{c.qty}</span>
                  <button onClick={() => addToCart(c.item)} style={{ color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.2rem' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>Rp {total.toLocaleString('id-ID')}</span>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem', opacity: cart.length === 0 || isProcessing ? 0.5 : 1 }}
          onClick={handleCheckout}
          disabled={cart.length === 0 || isProcessing}
        >
          {isProcessing ? 'Memproses...' : 'Bayar Sekarang'}
        </button>
      </div>

    </div>
  );
}
