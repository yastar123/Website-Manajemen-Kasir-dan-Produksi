import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TransactionItem } from '../types';

interface ReceiptPreviewProps {
  items: TransactionItem[];
  total: number;
  paymentMethod: string;
  cashierName: string;
  onClose: () => void;
  onPrint: () => void;
}

const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({
  items,
  total,
  paymentMethod,
  cashierName,
  onClose,
  onPrint
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const currentDate = new Date();
  const transactionId = `TRX${currentDate.getTime().toString().slice(-8)}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="pos-card max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-white p-6">
          {/* Header */}
          <div className="text-center mb-6 border-b-2 border-dashed border-border pb-4">
            <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-primary-foreground">🏪</span>
            </div>
            <h2 className="text-xl font-bold text-foreground">SISTEM POS KASIR</h2>
            <p className="text-sm text-muted-foreground">Toko Roti & Kue</p>
            <p className="text-xs text-muted-foreground">Jl. Contoh No. 123, Jakarta</p>
            <p className="text-xs text-muted-foreground">Telp: (021) 1234-5678</p>
          </div>

          {/* Transaction Info */}
          <div className="mb-4 text-sm">
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">No. Transaksi:</span>
              <span className="font-mono text-foreground">{transactionId}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Tanggal:</span>
              <span className="text-foreground">{currentDate.toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Waktu:</span>
              <span className="text-foreground">{currentDate.toLocaleTimeString('id-ID')}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Kasir:</span>
              <span className="text-foreground">{cashierName}</span>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-b border-dashed border-border py-4 mb-4">
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span className="text-foreground font-medium">{item.menuName}</span>
                    <span className="text-foreground">{formatCurrency(item.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{item.quantity} x {formatCurrency(item.price)}</span>
                    <span className="font-medium text-foreground">{formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-foreground">TOTAL</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pembayaran:</span>
              <span className="text-foreground">{paymentMethod}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-dashed border-border pt-4 text-xs text-muted-foreground">
            <p className="mb-1">Terima kasih atas kunjungan Anda!</p>
            <p className="mb-1">Barang yang sudah dibeli tidak dapat dikembalikan</p>
            <p>Kritik & saran: kontak@tokoku.com</p>
            <div className="mt-3 p-2 bg-muted rounded">
              <p className="text-foreground font-medium">💳 Transaksi berhasil!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6">
            <Button
              onClick={onPrint}
              className="flex-1 gradient-success text-success-foreground"
            >
              🖨️ Print Struk
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Tutup
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReceiptPreview;