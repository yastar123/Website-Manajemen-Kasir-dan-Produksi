import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StorageService } from '../utils/storage';
import { Expense } from '../types';
import { toast } from '../hooks/use-toast';

const ExpenseManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({
    category: 'Operasional',
    description: '',
    amount: 0
  });

  const expenseCategories = [
    'Operasional',
    'Sewa',
    'Listrik & Air',
    'Internet & Telepon',
    'Gaji Karyawan',
    'Transport & Delivery',
    'Pemasaran',
    'Perawatan Alat',
    'Asuransi',
    'Pajak',
    'Lainnya'
  ];

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = () => {
    setExpenses(StorageService.getExpenses());
  };

  const addExpense = () => {
    if (!newExpense.description || newExpense.amount <= 0) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap isi deskripsi dan jumlah pengeluaran",
        variant: "destructive"
      });
      return;
    }

    const expense: Expense = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      category: newExpense.category,
      description: newExpense.description,
      amount: newExpense.amount
    };

    const updatedExpenses = [...expenses, expense];
    StorageService.setExpenses(updatedExpenses);
    setExpenses(updatedExpenses);

    // Reset form
    setNewExpense({ category: 'Operasional', description: '', amount: 0 });
    setIsAdding(false);

    toast({
      title: "Pengeluaran berhasil dicatat!",
      description: `${newExpense.category}: ${formatCurrency(newExpense.amount)}`,
    });
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter(e => e.id !== id);
    StorageService.setExpenses(updatedExpenses);
    setExpenses(updatedExpenses);
    toast({
      title: "Pengeluaran dihapus",
      description: "Data pengeluaran telah dihapus"
    });
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

  // Calculate monthly summary
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyExpenses = expenses.filter(e => {
    const expenseDate = new Date(e.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  const expenseByCategory = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">💸 Manajemen Pengeluaran</h2>
          <p className="text-muted-foreground">Catat dan kelola pengeluaran operasional bisnis</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="gradient-primary text-primary-foreground"
        >
          + Tambah Pengeluaran
        </Button>
      </div>

      {/* Monthly Summary */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">📊 Ringkasan Bulan Ini</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalMonthlyExpenses)}</p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Jumlah Transaksi</p>
              <p className="text-2xl font-bold text-primary">{monthlyExpenses.length}</p>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Rata-rata Harian</p>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(totalMonthlyExpenses / new Date().getDate())}
              </p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Kategori Terbanyak</p>
              <p className="text-lg font-bold text-success">
                {Object.keys(expenseByCategory).length > 0 
                  ? Object.entries(expenseByCategory).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : 'Belum ada'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Add Expense Form */}
      {isAdding && (
        <Card className="pos-card">
          <div className="gradient-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">📝 Tambah Pengeluaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kategori *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {expenseCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Deskripsi *</label>
                <Input
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Misal: Bayar listrik bulan ini"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Jumlah *</label>
                <Input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>

            {newExpense.amount > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <h4 className="font-semibold text-destructive mb-2">💰 Konfirmasi Pengeluaran</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Kategori:</p>
                    <p className="font-medium text-foreground">{newExpense.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deskripsi:</p>
                    <p className="font-medium text-foreground">{newExpense.description || '-'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jumlah:</p>
                    <p className="font-bold text-destructive">{formatCurrency(newExpense.amount)}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={addExpense}
                className="gradient-success text-success-foreground"
                disabled={!newExpense.description || newExpense.amount <= 0}
              >
                💸 Catat Pengeluaran
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewExpense({ category: 'Operasional', description: '', amount: 0 });
                }}
              >
                Batal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Expense by Category */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">📈 Pengeluaran per Kategori (Bulan Ini)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(expenseByCategory).map(([category, amount]) => (
              <div key={category} className="p-4 bg-white rounded-lg border">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">{category}</h4>
                  <span className="font-bold text-destructive">{formatCurrency(amount)}</span>
                </div>
                <div className="mt-2 w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-destructive h-2 rounded-full"
                    style={{ 
                      width: `${totalMonthlyExpenses > 0 ? (amount / totalMonthlyExpenses) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalMonthlyExpenses > 0 ? ((amount / totalMonthlyExpenses) * 100).toFixed(1) : 0}% dari total
                </p>
              </div>
            ))}
          </div>
          {Object.keys(expenseByCategory).length === 0 && (
            <p className="text-center text-muted-foreground py-4">Belum ada pengeluaran bulan ini</p>
          )}
        </div>
      </Card>

      {/* Expense List */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">📋 Riwayat Pengeluaran</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-foreground">Tanggal</th>
                  <th className="text-left p-3 text-foreground">Kategori</th>
                  <th className="text-left p-3 text-foreground">Deskripsi</th>
                  <th className="text-left p-3 text-foreground">Jumlah</th>
                  <th className="text-left p-3 text-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice().reverse().map((expense) => (
                  <tr key={expense.id} className="border-b border-border/50">
                    <td className="p-3">
                      <p className="text-foreground">{formatDate(expense.date)}</p>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="text-foreground">{expense.description}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-destructive">{formatCurrency(expense.amount)}</p>
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteExpense(expense.id)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expenses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Belum ada riwayat pengeluaran</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ExpenseManagement;