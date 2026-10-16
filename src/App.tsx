import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './tabs/DashboardTab';
import { MenuTab } from './tabs/MenuTab';
import { CloudCafesTab } from './tabs/CloudCafesTab';
import { AppSectionsTab } from './tabs/AppSectionsTab';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'menu':
        return <MenuTab />;
      case 'cafes':
        return <CloudCafesTab />;
      case 'sections':
        return <AppSectionsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderTab()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
