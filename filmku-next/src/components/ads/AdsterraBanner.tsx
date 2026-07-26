'use client';

import React, { useState, useEffect } from 'react';
import { checkIsAdminAction } from '@/actions/check-admin';

interface AdsterraBannerProps {
  className?: string;
}

export default function AdsterraBanner({ className = '' }: AdsterraBannerProps) {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkIsAdminAction().then((adminStatus) => {
      setIsAdmin(adminStatus);
    });

    const checkWidth = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (isAdmin) return null; // Tidak menampilkan banner iklan untuk admin (didosyukur123@gmail.com)

  const bannerKey = isDesktop
    ? '2863e6835dd7edd3cc58807ea1d450f8' // 728x90
    : '4aca16c852c4c6497c64f66836a59775'; // 320x50 / mobile

  const width = isDesktop ? 728 : 320;
  const height = isDesktop ? 90 : 50;

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        <script>
          atOptions = {
            'key' : '${bannerKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script src="https://www.highperformanceformat.com/${bannerKey}/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div
      className={`adsterra-banner-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '2rem auto',
        padding: '0.75rem',
        background: 'linear-gradient(180deg, #160404 0%, #0d0101 100%)',
        border: '1px solid rgba(229, 9, 20, 0.25)',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
        maxWidth: isDesktop ? `${width + 24}px` : '100%',
        width: '100%',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
      }}
    >
      <span
        style={{
          fontSize: '0.65rem',
          fontWeight: 700,
          color: '#888',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: '0.4rem'
        }}
      >
        SPONSORED
      </span>

      <iframe
        title="FILMKU Advertisement"
        srcDoc={srcDoc}
        width={width}
        height={height}
        style={{
          border: 'none',
          overflow: 'hidden',
          display: 'block',
          maxWidth: '100%'
        }}
        scrolling="no"
      />
    </div>
  );
}
