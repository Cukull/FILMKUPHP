'use client';

import { useState } from 'react';

const faqs = [
  {
    q: "Apakah bisa pesan tiket lebih dari 1 kursi?",
    a: "Ya, Anda bisa memilih beberapa kursi sekaligus di halaman pemilihan kursi sebelum melanjutkan ke pembayaran.",
  },
  {
    q: "Apakah tiket bisa di-cancel atau di-refund?",
    a: "Tiket yang sudah dibeli tidak dapat di-cancel atau di-refund. Pastikan Anda memeriksa jadwal sebelum melakukan pemesanan.",
  },
  {
    q: "Bagaimana cara mendapatkan e-ticket setelah pembayaran?",
    a: "E-ticket akan dikirimkan otomatis ke email Anda segera setelah pembayaran berhasil dikonfirmasi.",
  },
  {
    q: "Apakah FILMKU menyediakan layanan Cafe & FnB?",
    a: "Ya! FILMKU menyediakan layanan Snack-Ku yang bisa Anda pesan bersamaan dengan tiket bioskop. Makanan akan diantarkan langsung ke kursi Anda.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="faq-section">
      <h2 className="faq-title">Tanya Jawab (FAQ)</h2>
      {faqs.map((faq, i) => (
        <div key={i} className="faq-item">
          <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
            <span>{faq.q}</span>
            <span style={{ color: 'var(--accent)', fontSize: '1.2rem', flexShrink: 0 }}>
              {open === i ? '−' : '+'}
            </span>
          </button>
          {open === i && <div className="faq-answer">{faq.a}</div>}
        </div>
      ))}
    </section>
  );
}
