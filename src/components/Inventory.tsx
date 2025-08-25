import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StorageService } from '../utils/storage';
import { RawMaterial } from '../types';
import { toast } from '../hooks/use-toast';

const Inventory: React.FC = () => {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMaterial, setNewMaterial] = useState<Omit<RawMaterial, 'id'>>({
    name: '',
    unit: 'kg',
    stock: 0,
    minStock: 0,
    price: 0,
    supplier: ''
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    const data = StorageService.getRawMaterials();
    setMaterials(data);
  };

  const saveMaterial = () => {
    if (!newMaterial.name || !newMaterial.supplier) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap isi semua field yang wajib",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      // Update existing
      const updatedMaterials = materials.map(m => 
        m.id === editingId ? { ...newMaterial, id: editingId } : m
      );
      setMaterials(updatedMaterials);
      StorageService.setRawMaterials(updatedMaterials);
      setEditingId(null);
      toast({
        title: "Berhasil diperbarui",
        description: "Data bahan baku telah diperbarui"
      });
    } else {
      // Add new
      const newId = Date.now().toString();
      const materialToAdd: RawMaterial = { ...newMaterial, id: newId };
      const updatedMaterials = [...materials, materialToAdd];
      setMaterials(updatedMaterials);
      StorageService.setRawMaterials(updatedMaterials);
      toast({
        title: "Berhasil ditambahkan",
        description: "Bahan baku baru telah ditambahkan"
      });
    }

    resetForm();
  };

  const editMaterial = (material: RawMaterial) => {
    setNewMaterial({
      name: material.name,
      unit: material.unit,
      stock: material.stock,
      minStock: material.minStock,
      price: material.price,
      supplier: material.supplier
    });
    setEditingId(material.id);
    setIsAddingNew(true);
  };

  const deleteMaterial = (id: string) => {
    const updatedMaterials = materials.filter(m => m.id !== id);
    setMaterials(updatedMaterials);
    StorageService.setRawMaterials(updatedMaterials);
    toast({
      title: "Berhasil dihapus",
      description: "Bahan baku telah dihapus"
    });
  };

  const resetForm = () => {
    setNewMaterial({
      name: '',
      unit: 'kg',
      stock: 0,
      minStock: 0,
      price: 0,
      supplier: ''
    });
    setIsAddingNew(false);
    setEditingId(null);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">📦 Manajemen Stok Bahan Baku</h2>
          <p className="text-muted-foreground">Kelola inventori bahan baku Anda</p>
        </div>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="gradient-primary text-primary-foreground"
        >
          + Tambah Bahan Baku
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAddingNew && (
        <Card className="pos-card">
          <div className="gradient-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editingId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku Baru'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nama Bahan *</label>
                <Input
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
                  placeholder="Nama bahan baku"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Supplier *</label>
                <Input
                  value={newMaterial.supplier}
                  onChange={(e) => setNewMaterial({...newMaterial, supplier: e.target.value})}
                  placeholder="Nama supplier"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Satuan</label>
                <select
                  value={newMaterial.unit}
                  onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="kg">Kilogram (kg)</option>
                  <option value="gram">Gram (g)</option>
                  <option value="liter">Liter (L)</option>
                  <option value="ml">Mililiter (ml)</option>
                  <option value="butir">Butir</option>
                  <option value="pack">Pack</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Harga per Satuan</label>
                <Input
                  type="number"
                  value={newMaterial.price}
                  onChange={(e) => setNewMaterial({...newMaterial, price: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Stok Saat Ini</label>
                <Input
                  type="number"
                  value={newMaterial.stock}
                  onChange={(e) => setNewMaterial({...newMaterial, stock: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Stok Minimum</label>
                <Input
                  type="number"
                  value={newMaterial.minStock}
                  onChange={(e) => setNewMaterial({...newMaterial, minStock: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={saveMaterial}
                className="gradient-success text-success-foreground"
              >
                {editingId ? 'Perbarui' : 'Simpan'}
              </Button>
              <Button
                variant="outline"
                onClick={resetForm}
              >
                Batal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Materials List */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daftar Bahan Baku</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-foreground">Nama Bahan</th>
                  <th className="text-left p-3 text-foreground">Stok</th>
                  <th className="text-left p-3 text-foreground">Min. Stok</th>
                  <th className="text-left p-3 text-foreground">Harga</th>
                  <th className="text-left p-3 text-foreground">Supplier</th>
                  <th className="text-left p-3 text-foreground">Status</th>
                  <th className="text-left p-3 text-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id} className="border-b border-border/50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium text-foreground">{material.name}</p>
                        <p className="text-sm text-muted-foreground">per {material.unit}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-foreground">{material.stock} {material.unit}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-muted-foreground">{material.minStock} {material.unit}</p>
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-foreground">{formatCurrency(material.price)}</p>
                    </td>
                    <td className="p-3">
                      <p className="text-foreground">{material.supplier}</p>
                    </td>
                    <td className="p-3">
                      {material.stock <= material.minStock ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/20 text-warning">
                          ⚠️ Stok Menipis
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                          ✅ Stok Aman
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => editMaterial(material)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteMaterial(material.id)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {materials.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Belum ada data bahan baku</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Inventory;