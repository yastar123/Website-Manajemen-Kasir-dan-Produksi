import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card } from './ui/card';
import MainContent from './MainContent';
import NotificationCenter from './NotificationCenter';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);

  const navigation: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'cashier', label: 'Kasir', icon: '🛒' },
    { id: 'inventory', label: 'Stok Bahan', icon: '📦' },
    { id: 'purchases', label: 'Pembelian', icon: '🛍️' },
    { id: 'menu', label: 'Menu', icon: '🍰' },
    { id: 'expenses', label: 'Pengeluaran', icon: '💸' },
    { id: 'reports', label: 'Laporan', icon: '📈' },
    { id: 'settings', label: 'Pengaturan', icon: '⚙️' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="gradient-card border-b border-border sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">🏪</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">Sistem POS Kasir</h1>
                  <p className="text-xs text-muted-foreground">Manajemen Kasir & Produksi</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(true)}
                  className="relative"
                >
                  <span className="text-lg">🔔</span>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
                    2
                  </span>
                </Button>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  Keluar
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation Tabs */}
          <Card className="pos-card mb-6">
            <div className="gradient-card p-4">
              <div className="flex flex-wrap gap-2">
                {navigation.map((item) => (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    className={`flex items-center space-x-2 ${
                      activeTab === item.id 
                        ? 'gradient-primary text-primary-foreground' 
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Content */}
          <div className="space-y-6">
            <MainContent activeTab={activeTab} />
          </div>
        </div>
      </div>

      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </>
  );
};

export default Layout;