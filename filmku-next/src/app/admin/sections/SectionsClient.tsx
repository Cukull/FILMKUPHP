'use client';

import { useState, useTransition } from 'react';
import { createDashboardSection, updateDashboardSection, deleteDashboardSection } from '@/actions/admin';
import * as LucideIcons from 'lucide-react';

// List of available professional icons
const ICON_OPTIONS = [
  'Film',
  'TrendingUp',
  'Star',
  'Play',
  'Heart',
  'Award',
  'MonitorPlay',
  'Flame',
  'Zap',
  'Compass',
  'Globe',
  'Ghost',
  'Sword',
  'Clock',
  'Ticket',
  // Curated section icons
  'Trophy',
  'Skull',
  'Bug',
  'Moon',
  'Coffee',
  'Brain',
  'Rocket',
  'Music',
  'Popcorn',
  'Mountain',
  'BookOpen',
  'Gamepad2',
  'Eye',
  'CloudRain',
];

type Section = {
  id: string;
  name: string;
  icon: string;
  order: number;
};

// Helper component to render a Lucide icon by string name
export function DynamicIcon({ name, size = 20 }: { name: string, size?: number }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Film;
  return <IconComponent size={size} />;
}

export default function SectionsClient({ initialData }: { initialData: Section[] }) {
  const [sections, setSections] = useState<Section[]>(initialData);
  const [isPending, startTransition] = useTransition();

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'Film',
    order: '0',
  });

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({ name: '', icon: 'Film', order: '0' });
  };

  const handleEdit = (sec: Section) => {
    setIsEditing(true);
    setEditId(sec.id);
    setFormData({
      name: sec.name,
      icon: sec.icon,
      order: sec.order.toString(),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kategori ini? Nama kategori akan otomatis dihapus dari semua film terkait secara real-time.')) return;
    
    startTransition(async () => {
      try {
        await deleteDashboardSection(id);
        setSections(sections.filter(s => s.id !== id));
      } catch (e) {
        alert('Gagal menghapus kategori');
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const payload = {
          name: formData.name,
          icon: formData.icon,
          order: parseInt(formData.order) || 0,
        };

        if (isEditing && editId) {
          const res = await updateDashboardSection(editId, payload);
          if (res.success) {
            setSections(sections.map(s => s.id === editId ? res.section : s));
            resetForm();
          }
        } else {
          const res = await createDashboardSection(payload);
          if (res.success) {
            setSections([...sections, res.section]);
            resetForm();
          }
        }
      } catch (e) {
        alert('Gagal menyimpan kategori');
      }
    });
  };

  // Shared styles
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '0.625rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    outline: 'none',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
      
      {/* ── FORM ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 600 }}>
          {isEditing ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nama Kategori</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Misal: Sorotan Layar Utama"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Ikon (SVG Profesional)</label>
            <select 
              required
              value={formData.icon}
              onChange={e => setFormData({ ...formData, icon: e.target.value })}
              style={{...inputStyle, WebkitAppearance: 'none'}}
            >
              {ICON_OPTIONS.map(iconName => (
                <option key={iconName} value={iconName} style={{ background: '#111' }}>
                  {iconName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Urutan (Terkecil tampil paling atas)</label>
            <input 
              required
              type="number" 
              value={formData.order}
              onChange={e => setFormData({ ...formData, order: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={isPending}
              style={{
                flex: 1,
                padding: '0.8rem',
                borderRadius: '0.5rem',
                background: 'var(--accent)',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.7 : 1,
              }}
            >
              {isPending ? 'Menyimpan...' : (isEditing ? 'Simpan' : 'Tambah')}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: '0.8rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── LIST ── */}
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left', background: 'rgba(255,255,255,0.03)' }}>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Urutan</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Kategori</th>
              <th style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {sections.sort((a,b) => a.order - b.order).map(sec => (
              <tr key={sec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>#{sec.order}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: 'var(--primary)' }}><DynamicIcon name={sec.icon} /></span>
                    <span style={{ fontWeight: 500 }}>{sec.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleEdit(sec)}
                    style={{ background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem', fontWeight: 600 }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(sec.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
            {sections.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada kategori.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
