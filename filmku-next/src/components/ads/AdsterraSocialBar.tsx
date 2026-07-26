'use client';

import { useEffect } from 'react';

export default function AdsterraSocialBar() {
  useEffect(() => {
    // Hindari duplikasi script jika navigasi client-side terjadi
    const scriptId = 'adsterra-social-bar-script';
    if (document.getElementById(scriptId)) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://pl30544130.effectivecpmnetwork.com/c3/96/ec/c396ec71cb1b4d7fb2c60fa98a186229.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Tidak menghapus script pada cleanup agar social bar tetap aktif antar halaman
    };
  }, []);

  return null;
}
