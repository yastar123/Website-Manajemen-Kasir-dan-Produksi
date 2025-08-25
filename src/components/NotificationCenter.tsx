import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { StorageService } from '../utils/storage';
import { RawMaterial, Transaction } from '../types';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: () => void;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (isOpen) {
      generateNotifications();
    }
  }, [isOpen]);

  const generateNotifications = () => {
    const notifications: Notification[] = [];
    
    // Check low stock
    const materials = StorageService.getRawMaterials();
    const lowStockItems = materials.filter(m => m.stock <= m.minStock);
    
    lowStockItems.forEach(item => {
      notifications.push({
        id: `low-stock-${item.id}`,
        type: 'warning',
        title: '⚠️ Stok Menipis!',
        message: `${item.name} tersisa ${item.stock} ${item.unit}`,
        timestamp: new Date(),
        read: false
      });
    });

    // Check today's sales milestone
    const today = new Date().toISOString().split('T')[0];
    const transactions = StorageService.getTransactions();
    const todayTransactions = transactions.filter(t => t.date === today);
    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    
    if (todaySales > 100000) {
      notifications.push({
        id: 'sales-milestone',
        type: 'success',
        title: '🎉 Target Tercapai!',
        message: `Penjualan hari ini sudah mencapai ${formatCurrency(todaySales)}`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      });
    }

    // System tips
    if (transactions.length > 10) {
      notifications.push({
        id: 'system-tip',
        type: 'info',
        title: '💡 Tips Sistem',
        message: 'Jangan lupa backup data secara berkala di menu Pengaturan',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true
      });
    }

    // Welcome notification for new users
    if (transactions.length <= 5) {
      notifications.push({
        id: 'welcome',
        type: 'info',
        title: '👋 Selamat Datang!',
        message: 'Terima kasih telah menggunakan Sistem POS. Jelajahi semua fitur yang tersedia.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: false
      });
    }

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setNotifications(notifications);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${diffDays} hari lalu`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'border-warning/20 bg-warning/10';
      case 'error': return 'border-destructive/20 bg-destructive/10';
      case 'success': return 'border-success/20 bg-success/10';
      case 'info': return 'border-primary/20 bg-primary/10';
      default: return 'border-border bg-muted/20';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.read);

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-end z-50 p-4">
      <Card className="pos-card w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="gradient-card">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground">🔔 Notifikasi</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                ✕
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  Semua ({notifications.length})
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  onClick={() => setFilter('unread')}
                >
                  Belum Baca ({unreadCount})
                </Button>
              </div>
              
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Tandai Semua Dibaca
                </Button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-96">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">
                  {filter === 'all' ? 'Tidak ada notifikasi' : 'Semua notifikasi sudah dibaca'}
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      notification.read ? 'opacity-60' : ''
                    } ${getTypeColor(notification.type)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg">{getTypeIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`font-medium text-sm ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </h4>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            ×
                          </Button>
                        </div>
                        <p className={`text-xs mt-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs h-auto p-1"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Tandai Dibaca
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationCenter;