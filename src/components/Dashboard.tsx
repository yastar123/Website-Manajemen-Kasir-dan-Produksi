import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { StorageService } from '../utils/storage';
import { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    totalTransactions: 0,
    bestSelling: null,
    lowStockItems: [],
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0
  });

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = () => {
    const transactions = StorageService.getTransactions();
    const materials = StorageService.getRawMaterials();
    const menuItems = StorageService.getMenuItems();
    const purchases = StorageService.getPurchases();
    const expenses = StorageService.getExpenses();
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Today's sales
    const todayTransactions = transactions.filter(t => t.date === today);
    const todaySales = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    
    // Monthly calculations
    const monthlyTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.total, 0);
    
    const monthlyPurchases = purchases.filter(p => {
      const pDate = new Date(p.date);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    });
    
    const monthlyExpenses = [
      ...monthlyPurchases.map(p => p.total),
      ...expenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentMonth && eDate.getFullYear() === currentYear;
      }).map(e => e.amount)
    ].reduce((sum, amount) => sum + amount, 0);

    // Best selling product
    const menuSales: { [key: string]: { count: number, menu: any } } = {};
    transactions.forEach(t => {
      t.items.forEach(item => {
        if (menuSales[item.menuId]) {
          menuSales[item.menuId].count += item.quantity;
        } else {
          const menu = menuItems.find(m => m.id === item.menuId);
          if (menu) {
            menuSales[item.menuId] = { count: item.quantity, menu };
          }
        }
      });
    });
    
    const bestSelling = Object.values(menuSales).reduce((max, current) => 
      current.count > (max?.count || 0) ? current : max, null as any
    )?.menu || null;

    // Low stock items
    const lowStockItems = materials.filter(m => m.stock <= m.minStock);

    setStats({
      todaySales,
      totalTransactions: todayTransactions.length,
      bestSelling,
      lowStockItems,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Ringkasan aktivitas bisnis Anda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-success rounded-lg flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Penjualan Hari Ini</p>
              <p className="text-xl font-bold text-success">{formatCurrency(stats.todaySales)}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-xl">🧾</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Transaksi Hari Ini</p>
              <p className="text-xl font-bold text-primary">{stats.totalTransactions}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-warning rounded-lg flex items-center justify-center">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Stok Menipis</p>
              <p className="text-xl font-bold text-warning">{stats.lowStockItems.length} Item</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-xl">📈</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Laba Bulan Ini</p>
              <p className={`text-xl font-bold ${stats.monthlyProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(stats.monthlyProfit)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Product */}
        <Card className="pos-card">
          <div className="gradient-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">🏆 Produk Terlaris</h3>
            {stats.bestSelling ? (
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 gradient-success rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🍰</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{stats.bestSelling.name}</h4>
                  <p className="text-sm text-muted-foreground">Kategori: {stats.bestSelling.category}</p>
                  <p className="text-lg font-bold text-success">{formatCurrency(stats.bestSelling.price)}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Belum ada data penjualan</p>
            )}
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="pos-card">
          <div className="gradient-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">⚠️ Stok Bahan Menipis</h3>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {stats.lowStockItems.length > 0 ? (
                stats.lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Sisa: {item.stock} {item.unit}</p>
                    </div>
                    <span className="text-warning font-bold">!</span>
                  </div>
                ))
              ) : (
                <p className="text-success">✅ Semua stok aman</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">📊 Ringkasan Bulan Ini</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(stats.monthlyExpenses)}</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Laba Bersih</p>
              <p className={`text-2xl font-bold ${stats.monthlyProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(stats.monthlyProfit)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;