import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StorageService } from '../utils/storage';
import { Transaction, Purchase, Expense } from '../types';

const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<string>('sales');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(StorageService.getTransactions());
    setPurchases(StorageService.getPurchases());
    setExpenses(StorageService.getExpenses());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const filterByDate = (data: any[], dateField: string = 'date') => {
    return data.filter(item => {
      const itemDate = new Date(item[dateField]).toISOString().split('T')[0];
      return itemDate >= dateFilter.startDate && itemDate <= dateFilter.endDate;
    });
  };

  const getSalesReport = () => {
    const filteredTransactions = filterByDate(transactions);
    const totalSales = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = filteredTransactions.length;
    
    // Product sales analysis
    const productSales: { [key: string]: { name: string, quantity: number, revenue: number } } = {};
    filteredTransactions.forEach(t => {
      t.items.forEach(item => {
        if (productSales[item.menuId]) {
          productSales[item.menuId].quantity += item.quantity;
          productSales[item.menuId].revenue += item.subtotal;
        } else {
          productSales[item.menuId] = {
            name: item.menuName,
            quantity: item.quantity,
            revenue: item.subtotal
          };
        }
      });
    });

    return {
      totalSales,
      totalTransactions,
      productSales: Object.values(productSales).sort((a, b) => b.quantity - a.quantity)
    };
  };

  const getCashFlowReport = () => {
    const filteredTransactions = filterByDate(transactions);
    const filteredPurchases = filterByDate(purchases);
    const filteredExpenses = filterByDate(expenses);
    
    const revenue = filteredTransactions.reduce((sum, t) => sum + t.total, 0);
    const purchaseCosts = filteredPurchases.reduce((sum, p) => sum + p.total, 0);
    const operationalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = purchaseCosts + operationalExpenses;
    const netProfit = revenue - totalExpenses;

    return {
      revenue,
      purchaseCosts,
      operationalExpenses,
      totalExpenses,
      netProfit
    };
  };

  const renderSalesReport = () => {
    const report = getSalesReport();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="stat-card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-success rounded-lg flex items-center justify-center">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Penjualan</p>
                <p className="text-xl font-bold text-success">{formatCurrency(report.totalSales)}</p>
              </div>
            </div>
          </Card>
          
          <Card className="stat-card">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-xl">🧾</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jumlah Transaksi</p>
                <p className="text-xl font-bold text-primary">{report.totalTransactions}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="pos-card">
          <div className="gradient-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">🏆 Produk Terlaris</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-foreground">Produk</th>
                    <th className="text-left p-3 text-foreground">Jumlah Terjual</th>
                    <th className="text-left p-3 text-foreground">Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.productSales.map((product, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="p-3">
                        <p className="font-medium text-foreground">{product.name}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-foreground">{product.quantity} unit</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-success">{formatCurrency(product.revenue)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {report.productSales.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Tidak ada data penjualan dalam periode ini</p>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="pos-card">
          <div className="gradient-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">📋 Detail Transaksi</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-foreground">Tanggal</th>
                    <th className="text-left p-3 text-foreground">Total</th>
                    <th className="text-left p-3 text-foreground">Metode Bayar</th>
                    <th className="text-left p-3 text-foreground">Kasir</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByDate(transactions).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-border/50">
                      <td className="p-3">
                        <p className="text-foreground">{formatDate(transaction.date)}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-success">{formatCurrency(transaction.total)}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-foreground">{transaction.paymentMethod}</p>
                      </td>
                      <td className="p-3">
                        <p className="text-foreground">{transaction.cashierName}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderCashFlowReport = () => {
    const report = getCashFlowReport();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="stat-card">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Pendapatan</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(report.revenue)}</p>
            </div>
          </Card>
          
          <Card className="stat-card">
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Pengeluaran</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(report.totalExpenses)}</p>
            </div>
          </Card>
          
          <Card className="stat-card">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Laba Bersih</p>
              <p className={`text-2xl font-bold ${report.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(report.netProfit)}
              </p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="pos-card">
            <div className="gradient-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">💰 Breakdown Pengeluaran</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-foreground">Pembelian Bahan Baku</span>
                  <span className="font-medium text-destructive">{formatCurrency(report.purchaseCosts)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span className="text-foreground">Operasional Lainnya</span>
                  <span className="font-medium text-destructive">{formatCurrency(report.operationalExpenses)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
                  <span className="font-semibold text-foreground">Total Pengeluaran</span>
                  <span className="font-bold text-destructive">{formatCurrency(report.totalExpenses)}</span>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="pos-card">
            <div className="gradient-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">📊 Margin Keuntungan</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Margin Keuntungan</p>
                  <p className={`text-3xl font-bold ${report.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {report.revenue > 0 ? ((report.netProfit / report.revenue) * 100).toFixed(1) : '0'}%
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${report.netProfit >= 0 ? 'bg-success' : 'bg-destructive'}`}
                    style={{ 
                      width: `${Math.min(Math.abs((report.netProfit / report.revenue) * 100), 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {report.netProfit >= 0 ? 'Bisnis menguntungkan' : 'Perlu evaluasi pengeluaran'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const reportTabs = [
    { id: 'sales', label: 'Laporan Penjualan', icon: '📈' },
    { id: 'cashflow', label: 'Arus Kas & Laba Rugi', icon: '💰' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">📊 Laporan & Analisis</h2>
        <p className="text-muted-foreground">Analisis performa bisnis Anda</p>
      </div>

      {/* Date Filter */}
      <Card className="pos-card">
        <div className="gradient-card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Dari:</label>
              <Input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({...dateFilter, startDate: e.target.value})}
                className="bg-background/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-foreground">Sampai:</label>
              <Input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({...dateFilter, endDate: e.target.value})}
                className="bg-background/50"
              />
            </div>
            <Button
              onClick={() => setDateFilter({
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
              })}
              variant="outline"
              size="sm"
            >
              Hari Ini
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Tabs */}
      <Card className="pos-card">
        <div className="gradient-card p-4">
          <div className="flex flex-wrap gap-2">
            {reportTabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeReport === tab.id ? "default" : "ghost"}
                className={`flex items-center space-x-2 ${
                  activeReport === tab.id 
                    ? 'gradient-primary text-primary-foreground' 
                    : 'hover:bg-accent'
                }`}
                onClick={() => setActiveReport(tab.id)}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {activeReport === 'sales' && renderSalesReport()}
      {activeReport === 'cashflow' && renderCashFlowReport()}
    </div>
  );
};

export default Reports;