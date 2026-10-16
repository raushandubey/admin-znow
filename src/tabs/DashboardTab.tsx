import React from 'react';
import { useAppContext } from '../context/AppContext';

export const DashboardTab: React.FC = () => {
  const { menuItems, cloudCafes, appSections } = useAppContext();

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }}>Total Menu Items</div>
          <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--color-primary)' }}>{menuItems.length}</div>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }}>Total Cloud Cafes</div>
          <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--color-primary)' }}>{cloudCafes.length}</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: 14, fontWeight: 500 }}>Active App Sections</div>
          <div style={{ fontSize: 36, fontWeight: 600, color: 'var(--color-primary)' }}>{appSections.length}</div>
        </div>
      </div>
    </div>
  );
};
