import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StorageService } from '../utils/storage';
import { MenuItem, RawMaterial, Recipe } from '../types';
import { toast } from '../hooks/use-toast';

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newMenu, setNewMenu] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    category: 'Kue',
    price: 0,
    recipe: [],
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setMenuItems(StorageService.getMenuItems());
    setRawMaterials(StorageService.getRawMaterials());
  };

  const addRecipeItem = () => {
    if (rawMaterials.length === 0) {
      toast({
        title: "Belum ada bahan baku",
        description: "Tambahkan bahan baku terlebih dahulu",
        variant: "destructive"
      });
      return;
    }
    setNewMenu({
      ...newMenu,
      recipe: [...newMenu.recipe, { materialId: rawMaterials[0].id, quantity: 0 }]
    });
  };

  const updateRecipeItem = (index: number, field: keyof Recipe, value: string | number) => {
    const updatedRecipe = newMenu.recipe.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    setNewMenu({ ...newMenu, recipe: updatedRecipe });
  };

  const removeRecipeItem = (index: number) => {
    const updatedRecipe = newMenu.recipe.filter((_, i) => i !== index);
    setNewMenu({ ...newMenu, recipe: updatedRecipe });
  };

  const saveMenu = () => {
    if (!newMenu.name || newMenu.price <= 0) {
      toast({
        title: "Data tidak lengkap",
        description: "Harap isi nama dan harga menu",
        variant: "destructive"
      });
      return;
    }

    if (newMenu.recipe.length === 0) {
      toast({
        title: "Resep kosong",
        description: "Tambahkan minimal satu bahan ke resep",
        variant: "destructive"
      });
      return;
    }

    if (editingId) {
      // Update existing
      const updatedMenus = menuItems.map(m => 
        m.id === editingId ? { ...newMenu, id: editingId } : m
      );
      setMenuItems(updatedMenus);
      StorageService.setMenuItems(updatedMenus);
      setEditingId(null);
      toast({
        title: "Berhasil diperbarui",
        description: "Menu telah diperbarui"
      });
    } else {
      // Add new
      const newId = Date.now().toString();
      const menuToAdd: MenuItem = { ...newMenu, id: newId };
      const updatedMenus = [...menuItems, menuToAdd];
      setMenuItems(updatedMenus);
      StorageService.setMenuItems(updatedMenus);
      toast({
        title: "Berhasil ditambahkan",
        description: "Menu baru telah ditambahkan"
      });
    }

    resetForm();
  };

  const editMenu = (menu: MenuItem) => {
    setNewMenu({
      name: menu.name,
      category: menu.category,
      price: menu.price,
      recipe: menu.recipe,
      isActive: menu.isActive
    });
    setEditingId(menu.id);
    setIsAddingNew(true);
  };

  const toggleMenuStatus = (id: string) => {
    const updatedMenus = menuItems.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive } : m
    );
    setMenuItems(updatedMenus);
    StorageService.setMenuItems(updatedMenus);
  };

  const deleteMenu = (id: string) => {
    const updatedMenus = menuItems.filter(m => m.id !== id);
    setMenuItems(updatedMenus);
    StorageService.setMenuItems(updatedMenus);
    toast({
      title: "Berhasil dihapus",
      description: "Menu telah dihapus"
    });
  };

  const resetForm = () => {
    setNewMenu({
      name: '',
      category: 'Kue',
      price: 0,
      recipe: [],
      isActive: true
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

  const getMaterialName = (materialId: string) => {
    const material = rawMaterials.find(m => m.id === materialId);
    return material ? `${material.name} (${material.unit})` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">🍰 Manajemen Menu</h2>
          <p className="text-muted-foreground">Kelola menu dan resep produk Anda</p>
        </div>
        <Button
          onClick={() => setIsAddingNew(true)}
          className="gradient-primary text-primary-foreground"
        >
          + Tambah Menu
        </Button>
      </div>

      {/* Add/Edit Form */}
      {isAddingNew && (
        <Card className="pos-card">
          <div className="gradient-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {editingId ? 'Edit Menu' : 'Tambah Menu Baru'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nama Menu *</label>
                <Input
                  value={newMenu.name}
                  onChange={(e) => setNewMenu({...newMenu, name: e.target.value})}
                  placeholder="Nama menu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Kategori</label>
                <select
                  value={newMenu.category}
                  onChange={(e) => setNewMenu({...newMenu, category: e.target.value})}
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="Kue">Kue</option>
                  <option value="Roti">Roti</option>
                  <option value="Pastry">Pastry</option>
                  <option value="Minuman">Minuman</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Harga Jual *</label>
                <Input
                  type="number"
                  value={newMenu.price}
                  onChange={(e) => setNewMenu({...newMenu, price: parseFloat(e.target.value) || 0})}
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newMenu.isActive}
                  onChange={(e) => setNewMenu({...newMenu, isActive: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-foreground">Menu Aktif</label>
              </div>
            </div>

            {/* Recipe Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-semibold text-foreground">Resep Bahan Baku</h4>
                <Button
                  onClick={addRecipeItem}
                  variant="outline"
                  size="sm"
                >
                  + Tambah Bahan
                </Button>
              </div>

              <div className="space-y-3">
                {newMenu.recipe.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                    <select
                      value={item.materialId}
                      onChange={(e) => updateRecipeItem(index, 'materialId', e.target.value)}
                      className="flex-1 p-2 border border-border rounded bg-background text-foreground"
                    >
                      {rawMaterials.map((material) => (
                        <option key={material.id} value={material.id}>
                          {material.name} ({material.unit})
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      step="0.1"
                      value={item.quantity}
                      onChange={(e) => updateRecipeItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="Jumlah"
                      className="w-24"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeRecipeItem(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                {newMenu.recipe.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">Belum ada bahan dalam resep</p>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={saveMenu}
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

      {/* Menu List */}
      <Card className="pos-card">
        <div className="gradient-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daftar Menu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((menu) => (
              <Card key={menu.id} className={`pos-card ${!menu.isActive ? 'opacity-60' : ''}`}>
                <div className="bg-white p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                        <span className="text-xl">🍰</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{menu.name}</h4>
                        <p className="text-sm text-muted-foreground">{menu.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant={menu.isActive ? "destructive" : "default"}
                        onClick={() => toggleMenuStatus(menu.id)}
                      >
                        {menu.isActive ? '⏸️' : '▶️'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-lg font-bold text-primary">{formatCurrency(menu.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      Status: {menu.isActive ? 'Aktif' : 'Non-aktif'}
                    </p>
                  </div>

                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-foreground mb-2">Bahan yang digunakan:</h5>
                    <div className="space-y-1">
                      {menu.recipe.map((item, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          • {getMaterialName(item.materialId)}: {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => editMenu(menu)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteMenu(menu.id)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {menuItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Belum ada menu yang dibuat</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MenuManagement;