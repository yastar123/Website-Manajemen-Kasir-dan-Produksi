import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StorageService } from '../utils/storage';
import { RawMaterial, Purchase } from '../types';
import { toast } from '../hooks/use-toast';

const PurchaseManagement: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPurchase, setNewPurchase] = useState({
    materialId: '',
    quantity: 0,
    price: 0,
    supplier: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMaterials(StorageService.getRawMaterials());
    setPurchases(StorageService.getPurchases());
  };

  const addPurchase = () => {
    if (!newPurchase.materialId || newPurchase.quantity <= 0) {
      toast({
        title: "Data tidak lengkap",
        description: "Pilih bahan dan masukkan jumlah yang valid",
        variant: "destructive"
      });
      return;
    }

    const material = materials.find(m => m.id === newPurchase.materialId);
    if (!material) return;

    // Create purchase record
    const purchase: Purchase = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      materialId: newPurchase.materialId,
      materialName: material.name,
      quantity: newPurchase.quantity,
      price: newPurchase.price,
      total: newPurchase.quantity * newPurchase.price,
      supplier: newPurchase.supplier || material.supplier
    };

    // Update stock
    const updatedMaterials = materials.map(m => 
      m.id === newPurchase.materialId 
        ? { ...m, stock: m.stock + newPurchase.quantity }
        : m
    );

    // Save data
    StorageService.setPurchases([...purchases, purchase]);
    StorageService.setRawMaterials(updatedMaterials);
    
    // Update local state
    setPurchases([...purchases, purchase]);
    setMaterials(updatedMaterials);

    // Reset form
    setNewPurchase({ materialId: '', quantity: 0, price: 0, supplier: '' });
    setIsAdding(false);

    toast({
      title: "Pembelian berhasil dicatat!",
      description: `Stok ${material.name} bertambah ${newPurchase.quantity} ${material.unit}`,
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

  const selectedMaterial = materials.find(m => m.id === newPurchase.materialId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">📦 Manajemen Pembelian</h2>
          <p className="text-muted-foreground">Catat pembelian bahan baku untuk restok inventory</p>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="gradient-primary text-primary-foreground"
        >
          + Tambah Pembelian
        </Button>
      </div>

      {/* Add Purchase Form */}
      {isAdding && (
        <Card className="pos-card">
          <div className="gradient-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">📝 Catat Pembelian Baru</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pilih Bahan Baku *</label>
                <select
                  value={newPurchase.materialId}
                  onChange={(e) => {
                    const material = materials.find(m => m.id === e.target.value);
                    setNewPurchase({
                      ...newPurchase, 
                      materialId: e.target.value,
                      supplier: material?.supplier || '',
                      price: material?.price || 0
                    });
                  }}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="">-- Pilih Bahan --</option>
                  {materials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} (Stok: {material.stock} {material.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Supplier</label>
                <Input
                  value={newPurchase.supplier}
                  onChange={(e) => setNewPurchase({...newPurchase, supplier: e.target.value})}
                  placeholder="Nama supplier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Jumlah Beli {selectedMaterial && `(${selectedMaterial.unit})`} *
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={newPurchase.quantity}
                  onChange={(e) => setNewPurchase({...newPurchase, quantity: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Harga per {selectedMaterial?.unit || 'unit'}
                </label>
                <Input
                  type="number"
                  value={newPurchase.price}
                  onChange={(e) => setNewPurchase({...newPurchase, price: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>

            {selectedMaterial && newPurchase.quantity > 0 && (
              <div className="mt-4 p-4 bg-success/10 rounded-lg border border-success/20">
                <h4 className="font-semibold text-success mb-2">📊 Ringkasan Pembelian</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Bahan:</p>
                    <p className="font-medium text-foreground">{selectedMaterial.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Jumlah:</p>
                    <p className="font-medium text-foreground">{newPurchase.quantity} {selectedMaterial.unit}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Harga Satuan:</p>
                    <p className="font-medium text-foreground">{formatCurrency(newPurchase.price)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total:</p>
                    <p className="font-bold text-success">{formatCurrency(newPurchase.quantity * newPurchase.price)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stok Setelah:</p>
                    <p className="font-medium text-primary">{selectedMaterial.stock + newPurchase.quantity} {selectedMaterial.unit}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 mt-6">
              <Button
                onClick={addPurchase}
                className="gradient-success text-success-foreground"
                disabled={!newPurchase.materialId || newPurchase.quantity <= 0}
              >
                💰 Catat Pembelian
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewPurchase({ materialId: '', quantity: 0, price: 0, supplier: '' });
                }}
              >
                Batal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Purchase History */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">📋 Riwayat Pembelian</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-foreground">Tanggal</th>
                  <th className="text-left p-3 text-foreground">Bahan</th>
                  <th className="text-left p-3 text-foreground">Jumlah</th>
                  <th className="text-left p-3 text-foreground">Harga</th>
                  <th className="text-left p-3 text-foreground">Total</th>
                  <th className="text-left p-3 text-foreground">Supplier</th>
                </tr>
              </thead>
              <tbody>
                {purchases.slice().reverse().map((purchase) => (
                  <tr key={purchase.id} className="border-b border-border/50">
                    <td className="p-3">
                      <p className="text-foreground">{formatDate(purchase.date)}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-foreground">{purchase.materialName}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-foreground">{purchase.quantity}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-foreground">{formatCurrency(purchase.price)}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-success">{formatCurrency(purchase.total)}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-foreground">{purchase.supplier}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {purchases.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Belum ada riwayat pembelian</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Low Stock Alert */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">⚠️ Rekomendasi Restok</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {materials.filter(m => m.stock <= m.minStock).map((material) => (
              <div key={material.id} className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-foreground">{material.name}</h4>
                  <span className="text-warning">⚠️</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Stok: {material.stock} / Min: {material.minStock} {material.unit}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setNewPurchase({
                      materialId: material.id,
                      quantity: material.minStock * 2,
                      price: material.price,
                      supplier: material.supplier
                    });
                    setIsAdding(true);
                  }}
                  className="w-full"
                  variant="outline"
                >
                  🛒 Beli Sekarang
                </Button>
              </div>
            ))}
          </div>
          {materials.filter(m => m.stock <= m.minStock).length === 0 && (
            <p className="text-center text-success py-4">✅ Semua stok masih aman!</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PurchaseManagement;