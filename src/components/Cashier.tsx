import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { StorageService } from '../utils/storage';
import { MenuItem, TransactionItem, Transaction } from '../types';
import { useAuth } from '../hooks/useAuth';
import { toast } from '../hooks/use-toast';
import QuickSearch from './QuickSearch';
import ReceiptPreview from './ReceiptPreview';
import DiscountSystem from './DiscountSystem';

interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  reason: string;
}

const Cashier: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<TransactionItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>('Tunai');
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = () => {
    const items = StorageService.getMenuItems().filter(item => item.isActive);
    setMenuItems(items);
  };

  const addToCart = (menu: MenuItem) => {
    const existingItem = cart.find(item => item.menuId === menu.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuId === menu.id 
          ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: TransactionItem = {
        menuId: menu.id,
        menuName: menu.name,
        quantity: 1,
        price: menu.price,
        subtotal: menu.price
      };
      setCart([...cart, newItem]);
    }
    
    toast({
      title: "Ditambahkan ke keranjang",
      description: `${menu.name} x1`,
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart(cart.filter(item => item.menuId !== menuId));
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuId);
      return;
    }

    setCart(cart.map(item => 
      item.menuId === menuId 
        ? { ...item, quantity, subtotal: quantity * item.price }
        : item
    ));
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  };

  const calculateDiscount = () => {
    if (!discount) return 0;
    
    const subtotal = getSubtotal();
    if (discount.type === 'percentage') {
      return Math.min((subtotal * discount.value) / 100, subtotal);
    } else {
      return Math.min(discount.value, subtotal);
    }
  };

  const getTotalAmount = () => {
    return getSubtotal() - calculateDiscount();
  };

  const processSale = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang kosong",
        description: "Tambahkan item ke keranjang terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "User tidak ditemukan",
        variant: "destructive"
      });
      return;
    }

    // Create transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      items: cart,
      total: getTotalAmount(),
      paymentMethod,
      cashierName: user.name
    };

    // Update stock for each item in the cart
    cart.forEach(item => {
      StorageService.updateStockAfterSale(item.menuId, item.quantity);
    });

    // Save transaction
    StorageService.addTransaction(transaction);

    // Show receipt
    setLastTransaction(transaction);
    setShowReceipt(true);

    // Clear cart and discount
    setCart([]);
    setDiscount(null);

    toast({
      title: "Transaksi berhasil!",
      description: `Total: ${formatCurrency(transaction.total)}`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePrintReceipt = () => {
    // Simulate printing
    toast({
      title: "Struk dicetak!",
      description: "Struk berhasil dicetak ke printer",
    });
    setShowReceipt(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Search */}
          <Card className="pos-card">
            <div className="p-4">
              <QuickSearch menuItems={menuItems} onSelectItem={addToCart} />
            </div>
          </Card>

          {/* Menu Grid */}
          <Card className="pos-card">
            <div className="gradient-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">🛒 Pilih Menu</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((menu) => (
                  <div
                    key={menu.id}
                    className="pos-card p-4 pos-card-hover cursor-pointer bg-white"
                    onClick={() => addToCart(menu)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-primary rounded-lg flex items-center justify-center">
                        <span className="text-xl">🍰</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{menu.name}</h3>
                        <p className="text-sm text-muted-foreground">{menu.category}</p>
                        <p className="text-lg font-bold text-primary">{formatCurrency(menu.price)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Cart & Checkout */}
        <div className="space-y-4">
          <Card className="pos-card">
            <div className="gradient-card p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">🧾 Keranjang</h2>
              
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Keranjang kosong</p>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.menuId} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{item.menuName}</h4>
                        <p className="text-sm text-muted-foreground">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.menuId, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.menuId, parseInt(e.target.value) || 0)}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.menuId, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeFromCart(item.menuId)}
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Discount System */}
          {cart.length > 0 && (
            <DiscountSystem
              subtotal={getSubtotal()}
              onApplyDiscount={setDiscount}
              currentDiscount={discount}
              onRemoveDiscount={() => setDiscount(null)}
            />
          )}

          {/* Checkout */}
          {cart.length > 0 && (
            <Card className="pos-card">
              <div className="gradient-card p-6">
                <div className="space-y-4">
                  {/* Total Calculation */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-foreground">Subtotal:</span>
                      <span className="text-foreground">{formatCurrency(getSubtotal())}</span>
                    </div>
                    {discount && (
                      <div className="flex justify-between text-success">
                        <span>Diskon ({discount.reason}):</span>
                        <span>-{formatCurrency(calculateDiscount())}</span>
                      </div>
                    )}
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-foreground">Total:</span>
                        <span className="text-2xl font-bold text-primary">{formatCurrency(getTotalAmount())}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Metode Pembayaran</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                    >
                      <option value="Tunai">Tunai</option>
                      <option value="Kartu Debit">Kartu Debit</option>
                      <option value="Kartu Kredit">Kartu Kredit</option>
                      <option value="Transfer">Transfer</option>
                      <option value="E-Wallet">E-Wallet</option>
                    </select>
                  </div>

                  <Button
                    onClick={processSale}
                    className="w-full gradient-success text-success-foreground hover:opacity-90 transition-opacity"
                    size="lg"
                  >
                    💳 Proses Pembayaran
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Receipt Preview Modal */}
      {showReceipt && lastTransaction && (
        <ReceiptPreview
          items={lastTransaction.items}
          total={lastTransaction.total}
          paymentMethod={lastTransaction.paymentMethod}
          cashierName={lastTransaction.cashierName}
          onClose={() => setShowReceipt(false)}
          onPrint={handlePrintReceipt}
        />
      )}
    </>
  );
};

export default Cashier;