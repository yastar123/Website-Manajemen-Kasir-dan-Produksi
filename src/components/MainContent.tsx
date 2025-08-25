import React from 'react';
import Dashboard from './Dashboard';
import Cashier from './Cashier';
import Inventory from './Inventory';
import MenuManagement from './MenuManagement';
import Reports from './Reports';
import PurchaseManagement from './PurchaseManagement';
import ExpenseManagement from './ExpenseManagement';
import Settings from './Settings';

interface MainContentProps {
  activeTab: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'dashboard':
      return <Dashboard />;
    case 'cashier':
      return <Cashier />;
    case 'inventory':
      return <Inventory />;
    case 'menu':
      return <MenuManagement />;
    case 'reports':
      return <Reports />;
    case 'purchases':
      return <PurchaseManagement />;
    case 'expenses':
      return <ExpenseManagement />;
    case 'settings':
      return <Settings />;
    default:
      return <Dashboard />;
  }
};

export default MainContent;