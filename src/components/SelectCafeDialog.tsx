import React, { useState, useMemo } from 'react';
import type { CloudCafe } from '../context/AppContext';
import { X, Check } from 'lucide-react';

interface SelectCafeDialogProps {
  cafes: CloudCafe[];
  selectedIds: string[];
  onClose: () => void;
  onSave: (ids: string[]) => void;
}

export const SelectCafeDialog: React.FC<SelectCafeDialogProps> = ({ cafes, selectedIds, onClose, onSave }) => {
  const [search, setSearch] = useState('');
  const [checkedIds, setCheckedIds] = useState<string[]>([...selectedIds]);

  const filteredCafes = useMemo(() => {
    const term = search.toLowerCase();
    return cafes.filter(
      (c) =>
        c.cafe_name.toLowerCase().includes(term) ||
        c.area.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term)
    );
  }, [cafes, search]);

  const toggleId = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onSave(checkedIds);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2 className="modal-title">Select Cafés for Visibility</h2>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={onClose}>
            <X size={24} color="var(--color-text-secondary)" />
          </button>
        </div>

        <div className="form-group" style={{ marginTop: 16 }}>
          <input
            type="text"
            placeholder="Search cafés by name, location or city"
            className="form-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="cafe-list" style={{ maxHeight: 300, overflowY: 'auto', marginTop: 16 }}>
          {filteredCafes.map((cafe) => (
            <label key={cafe.id} style={{ display: 'flex', alignItems: 'center', padding: '8px 0', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checkedIds.includes(cafe.id)}
                onChange={() => toggleId(cafe.id)}
                style={{ marginRight: 8 }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{cafe.cafe_name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {cafe.area} – {cafe.city}
                </div>
              </div>
            </label>
          ))}
          {filteredCafes.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: 24 }}>
              No cafés match your search.
            </p>
          )}
        </div>

        <div className="modal-footer" style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Check size={16} style={{ marginRight: 4 }} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};
