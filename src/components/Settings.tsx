import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StorageService } from '../utils/storage';
import { toast } from '../hooks/use-toast';

const Settings: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState({
    name: 'Toko Roti & Kue',
    address: 'Jl. Contoh No. 123, Jakarta',
    phone: '(021) 1234-5678',
    email: 'kontak@tokoku.com'
  });

  const [notifications, setNotifications] = useState({
    lowStockAlert: true,
    dailyReport: true,
    salesAlert: false,
    systemUpdates: true
  });

  const [currency, setCurrency] = useState('IDR');
  const [language, setLanguage] = useState('id');
  const [taxRate, setTaxRate] = useState(0);

  const saveSettings = () => {
    // In a real app, this would save to a backend or enhanced localStorage
    localStorage.setItem('pos_store_info', JSON.stringify(storeInfo));
    localStorage.setItem('pos_notifications', JSON.stringify(notifications));
    localStorage.setItem('pos_currency', currency);
    localStorage.setItem('pos_language', language);
    localStorage.setItem('pos_tax_rate', taxRate.toString());

    toast({
      title: "Pengaturan tersimpan!",
      description: "Semua perubahan telah disimpan",
    });
  };

  const exportData = () => {
    const allData = {
      rawMaterials: StorageService.getRawMaterials(),
      menuItems: StorageService.getMenuItems(),
      transactions: StorageService.getTransactions(),
      purchases: StorageService.getPurchases(),
      expenses: StorageService.getExpenses(),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-pos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Data berhasil diexport!",
      description: "File backup telah didownload",
    });
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ PERINGATAN: Ini akan menghapus SEMUA data! Apakah Anda yakin?')) {
      if (window.confirm('Konfirmasi sekali lagi: Semua data akan hilang permanen!')) {
        localStorage.clear();
        window.location.reload();
      }
    }
  };

  const resetToDemo = () => {
    if (window.confirm('Reset ke data demo? Data saat ini akan hilang.')) {
      localStorage.clear();
      StorageService.initializeData();
      toast({
        title: "Reset berhasil!",
        description: "Data telah direset ke contoh demo",
      });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">⚙️ Pengaturan Sistem</h2>
        <p className="text-muted-foreground">Konfigurasi sistem POS Anda</p>
      </div>

      {/* Store Information */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">🏪 Informasi Toko</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nama Toko</label>
              <Input
                value={storeInfo.name}
                onChange={(e) => setStoreInfo({...storeInfo, name: e.target.value})}
                placeholder="Nama toko Anda"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Alamat</label>
              <Input
                value={storeInfo.address}
                onChange={(e) => setStoreInfo({...storeInfo, address: e.target.value})}
                placeholder="Alamat lengkap"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Telepon</label>
              <Input
                value={storeInfo.phone}
                onChange={(e) => setStoreInfo({...storeInfo, phone: e.target.value})}
                placeholder="Nomor telepon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                value={storeInfo.email}
                onChange={(e) => setStoreInfo({...storeInfo, email: e.target.value})}
                placeholder="Email kontak"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* System Configuration */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">⚡ Konfigurasi Sistem</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Mata Uang</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="IDR">Rupiah (IDR)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bahasa</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tarif Pajak (%)</label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">🔔 Pengaturan Notifikasi</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alert Stok Menipis</p>
                <p className="text-sm text-muted-foreground">Notifikasi ketika stok bahan baku hampir habis</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.lowStockAlert}
                onChange={(e) => setNotifications({...notifications, lowStockAlert: e.target.checked})}
                className="w-4 h-4 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Laporan Harian</p>
                <p className="text-sm text-muted-foreground">Ringkasan penjualan dan aktivitas harian</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.dailyReport}
                onChange={(e) => setNotifications({...notifications, dailyReport: e.target.checked})}
                className="w-4 h-4 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alert Penjualan Tinggi</p>
                <p className="text-sm text-muted-foreground">Notifikasi ketika penjualan melebihi target</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.salesAlert}
                onChange={(e) => setNotifications({...notifications, salesAlert: e.target.checked})}
                className="w-4 h-4 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Update Sistem</p>
                <p className="text-sm text-muted-foreground">Pemberitahuan fitur baru dan pembaruan</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.systemUpdates}
                onChange={(e) => setNotifications({...notifications, systemUpdates: e.target.checked})}
                className="w-4 h-4 rounded"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">💾 Manajemen Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Backup Data</h4>
              <p className="text-sm text-muted-foreground">
                Export semua data sistem untuk backup atau migrasi
              </p>
              <Button
                onClick={exportData}
                className="w-full gradient-primary text-primary-foreground"
              >
                📥 Export Data
              </Button>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Reset Sistem</h4>
              <p className="text-sm text-muted-foreground">
                Kembalikan ke pengaturan awal dengan data demo
              </p>
              <Button
                onClick={resetToDemo}
                variant="outline"
                className="w-full"
              >
                🔄 Reset ke Demo
              </Button>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <h4 className="font-medium text-destructive mb-2">⚠️ Zona Berbahaya</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Tindakan ini akan menghapus SEMUA data secara permanen dan tidak dapat dibatalkan.
            </p>
            <Button
              onClick={clearAllData}
              variant="destructive"
              size="sm"
            >
              🗑️ Hapus Semua Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          className="gradient-success text-success-foreground px-8"
          size="lg"
        >
          💾 Simpan Pengaturan
        </Button>
      </div>

      {/* System Info */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">ℹ️ Informasi Sistem</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Versi Sistem:</p>
              <p className="font-medium text-foreground">POS v2.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Install:</p>
              <p className="font-medium text-foreground">{new Date().toLocaleDateString('id-ID')}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Storage Usage:</p>
              <p className="font-medium text-foreground">
                {((JSON.stringify(localStorage).length / 1024 / 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;