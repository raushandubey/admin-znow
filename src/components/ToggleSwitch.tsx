import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => (
  <label className="toggle-switch" style={{ display: 'inline-block', cursor: 'pointer' }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ display: 'none' }}
    />
    <span
      style={{
        width: '40px',
        height: '20px',
        background: checked ? 'var(--color-primary)' : 'var(--color-surface)',
        borderRadius: '10px',
        position: 'relative',
        display: 'inline-block',
        transition: 'background 0.2s',
      }}
    >
      <span
        style={{
          content: '""',
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '16px',
          height: '16px',
          background: '#fff',
          borderRadius: '50%',
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </span>
  </label>
);

