'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Ringkasan', path: '/admin', icon: '📊' },
    { name: 'Kelola Film', path: '/admin/film', icon: '🎬' },
    { name: 'Kelola Menu F&B', path: '/admin/fnb', icon: '🍔' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 72px)', background: 'var(--bg-base)' }}>
      {/* Sidebar Admin */}
      <aside style={{ width: '260px', background: 'var(--bg-surface)', padding: '2rem 1rem', borderRight: '1px solid var(--glass-border)' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', paddingLeft: '1rem', letterSpacing: '0.05em' }}>
          MENU ADMIN
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                href={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-secondary)',
                  background: isActive ? 'linear-gradient(90deg, rgba(229, 9, 20, 0.2) 0%, transparent 100%)' : 'transparent',
                  borderLeft: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-body)'
                }}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Admin */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
