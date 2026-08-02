'use client';

import { useState, useTransition, useEffect } from 'react';
import { createDashboardSection, updateDashboardSection, deleteDashboardSection, updateDashboardSectionOrders } from '@/actions/admin';
import * as LucideIcons from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
  // Pastikan data di-sort sejak awal agar urutannya benar di state
  const [sections, setSections] = useState<Section[]>(() => [...initialData].sort((a,b) => a.order - b.order));
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const newSections = Array.from(sections);
    const [movedSection] = newSections.splice(sourceIndex, 1);
    newSections.splice(destinationIndex, 0, movedSection);

    // Update the 'order' property for each section based on its new index (1-based index)
    const updatedSections = newSections.map((sec, idx) => ({
      ...sec,
      order: idx + 1,
    }));

    // Update UI immediately (optimistic UI)
    setSections(updatedSections);

    // Send the new orders to the server
    startTransition(async () => {
      try {
        const updates = updatedSections.map(sec => ({ id: sec.id, order: sec.order }));
        await updateDashboardSectionOrders(updates);
      } catch (error) {
        console.error("Gagal menyimpan urutan:", error);
        alert("Gagal menyimpan urutan. Silakan refresh halaman.");
      }
    });
  };

  
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
            setSections([...sections, res.section].sort((a,b) => a.order - b.order));
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
        {isMounted ? (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div style={{ width: '100%' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '50px 100px 1fr 150px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', padding: '1rem' }}>
                <div></div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Urutan</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Kategori</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Aksi</div>
              </div>
              
              {/* List */}
              <Droppable droppableId="sections-list">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '50px' }}>
                    {sections.map((sec, index) => (
                      <Draggable key={sec.id} draggableId={sec.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={{ 
                              display: 'grid',
                              gridTemplateColumns: '50px 100px 1fr 150px',
                              alignItems: 'center',
                              borderBottom: '1px solid rgba(255,255,255,0.05)',
                              background: snapshot.isDragging ? 'rgba(255,255,255,0.08)' : 'transparent',
                              padding: '1rem',
                              ...provided.draggableProps.style
                            }}
                          >
                            <div>
                              <div {...provided.dragHandleProps} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', cursor: 'grab' }}>
                                <LucideIcons.GripVertical size={20} />
                              </div>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>#{sec.order}</div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ color: 'var(--primary)' }}><DynamicIcon name={sec.icon} /></span>
                                <span style={{ fontWeight: 500 }}>{sec.name}</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
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
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {sections.length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Belum ada kategori.</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Memuat...</div>
        )}
      </div>

    </div>
  );
}
