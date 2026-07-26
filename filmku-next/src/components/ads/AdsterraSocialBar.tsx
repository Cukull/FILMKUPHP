'use client';

import { useEffect } from 'react';
import { checkIsAdminAction } from '@/actions/check-admin';

export default function AdsterraSocialBar() {
  useEffect(() => {
    async function initAds() {
      const isAdmin = await checkIsAdminAction();
      if (isAdmin) return; // Tidak menampilkan iklan untuk admin (didosyukur123@gmail.com)

      const scriptId = 'adsterra-social-bar-script';
      if (document.getElementById(scriptId)) return;

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://pl30544130.effectivecpmnetwork.com/c3/96/ec/c396ec71cb1b4d7fb2c60fa98a186229.js';
      script.async = true;
      document.body.appendChild(script);
    }
    initAds();
  }, []);

  return null;
}
