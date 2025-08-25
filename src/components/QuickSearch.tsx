import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MenuItem } from '../types';

interface QuickSearchProps {
  menuItems: MenuItem[];
  onSelectItem: (item: MenuItem) => void;
}

const QuickSearch: React.FC<QuickSearchProps> = ({ menuItems, onSelectItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = menuItems.filter(item =>
        item.isActive &&
        (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredItems(filtered);
      setIsOpen(true);
    } else {
      setFilteredItems([]);
      setIsOpen(false);
    }
  }, [searchTerm, menuItems]);

  const handleSelectItem = (item: MenuItem) => {
    onSelectItem(item);
    setSearchTerm('');
    setIsOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Simulate barcode scanning
  const simulateBarcodeScan = () => {
    const randomItem = menuItems[Math.floor(Math.random() * menuItems.length)];
    if (randomItem && randomItem.isActive) {
      onSelectItem(randomItem);
      setSearchTerm(randomItem.name);
      setTimeout(() => setSearchTerm(''), 1000);
    }
  };

  return (
    <div className="relative">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="🔍 Cari produk atau scan barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-12"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="text-muted-foreground">⌨️</span>
          </div>
        </div>
        <Button
          onClick={simulateBarcodeScan}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <span>📱</span>
          <span>Scan</span>
        </Button>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && filteredItems.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 pos-card max-h-64 overflow-y-auto">
          <div className="p-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectItem(item)}
                className="p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors border-b border-border/50 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-sm">🍰</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{formatCurrency(item.price)}</p>
                    <Button size="sm" variant="outline">Tambah</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* No Results */}
      {isOpen && searchTerm.length > 0 && filteredItems.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 pos-card">
          <div className="p-4 text-center">
            <p className="text-muted-foreground">❌ Produk tidak ditemukan</p>
            <p className="text-sm text-muted-foreground mt-1">
              Coba kata kunci lain atau scan barcode
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuickSearch;