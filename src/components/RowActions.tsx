import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const RowActions: React.FC<RowActionsProps> = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="row-actions" ref={containerRef} style={{ position: 'relative' }}>
      <button
        className="actions-trigger"
        onClick={() => setOpen((prev) => !prev)}
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        title="More actions"
      >
        <MoreVertical size={20} color="var(--color-text-secondary)" />
      </button>
      {open && (
        <div className="actions-menu" style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          background: 'var(--color-background)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          minWidth: '120px',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <button
            className="action-item"
            onClick={() => { setOpen(false); onEdit(); }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Edit size={16} /> Edit
          </button>
          <button
            className="action-item"
            onClick={() => { setOpen(false); onDelete(); }}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'red'
            }}
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
