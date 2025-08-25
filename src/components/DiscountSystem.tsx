import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Discount {
  type: 'percentage' | 'fixed';
  value: number;
  reason: string;
}

interface DiscountSystemProps {
  subtotal: number;
  onApplyDiscount: (discount: Discount) => void;
  currentDiscount: Discount | null;
  onRemoveDiscount: () => void;
}

const DiscountSystem: React.FC<DiscountSystemProps> = ({
  subtotal,
  onApplyDiscount,
  currentDiscount,
  onRemoveDiscount
}) => {
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const predefinedDiscounts = [
    { type: 'percentage' as const, value: 5, reason: 'Member Reguler (5%)' },
    { type: 'percentage' as const, value: 10, reason: 'Member VIP (10%)' },
    { type: 'percentage' as const, value: 15, reason: 'Promo Hari Ini (15%)' },
    { type: 'fixed' as const, value: 5000, reason: 'Diskon Pembelian Pertama' },
    { type: 'fixed' as const, value: 10000, reason: 'Voucher Rp 10.000' },
  ];

  const calculateDiscount = (discount: Discount) => {
    if (discount.type === 'percentage') {
      return Math.min((subtotal * discount.value) / 100, subtotal);
    } else {
      return Math.min(discount.value, subtotal);
    }
  };

  const applyCustomDiscount = () => {
    if (discountValue <= 0 || !discountReason.trim()) {
      return;
    }

    const maxValue = discountType === 'percentage' ? 100 : subtotal;
    const safeValue = Math.min(Math.max(0, discountValue), maxValue);

    onApplyDiscount({
      type: discountType,
      value: safeValue,
      reason: discountReason.trim()
    });

    // Reset form
    setDiscountValue(0);
    setDiscountReason('');
    setIsOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-3">
      {/* Current Discount Display */}
      {currentDiscount && (
        <Card className="pos-card">
          <div className="p-3 bg-success/10 border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-success">🎯 Diskon Diterapkan</p>
                <p className="text-sm text-foreground">{currentDiscount.reason}</p>
                <p className="text-xs text-muted-foreground">
                  {currentDiscount.type === 'percentage' 
                    ? `${currentDiscount.value}%` 
                    : formatCurrency(currentDiscount.value)
                  } = {formatCurrency(calculateDiscount(currentDiscount))}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onRemoveDiscount}
              >
                ❌
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Discount Controls */}
      {!currentDiscount && (
        <div className="space-y-3">
          {/* Quick Discount Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {predefinedDiscounts.slice(0, 4).map((discount, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => onApplyDiscount(discount)}
                className="text-xs p-2 h-auto flex flex-col items-center"
                disabled={subtotal <= 0}
              >
                <span className="font-medium">
                  {discount.type === 'percentage' ? `${discount.value}%` : formatCurrency(discount.value)}
                </span>
                <span className="text-xs opacity-80 text-center leading-tight">
                  {discount.reason.split('(')[0].trim()}
                </span>
              </Button>
            ))}
          </div>

          {/* Custom Discount Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-primary"
          >
            {isOpen ? '🔼 Tutup' : '🔽 Diskon Custom'}
          </Button>

          {/* Custom Discount Form */}
          {isOpen && (
            <Card className="pos-card">
              <div className="p-4 space-y-3">
                <h4 className="font-medium text-foreground">✨ Diskon Custom</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={discountType === 'percentage' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDiscountType('percentage')}
                  >
                    Persen (%)
                  </Button>
                  <Button
                    variant={discountType === 'fixed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDiscountType('fixed')}
                  >
                    Nominal (Rp)
                  </Button>
                </div>

                <div>
                  <Input
                    type="number"
                    placeholder={discountType === 'percentage' ? '0-100' : '0'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    max={discountType === 'percentage' ? 100 : subtotal}
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder="Alasan diskon (misal: Member VIP, Promo, dll)"
                    value={discountReason}
                    onChange={(e) => setDiscountReason(e.target.value)}
                  />
                </div>

                {discountValue > 0 && discountReason && (
                  <div className="p-2 bg-muted rounded text-sm">
                    <p className="text-muted-foreground">Preview:</p>
                    <p className="font-medium">
                      {discountReason} = {formatCurrency(calculateDiscount({ type: discountType, value: discountValue, reason: discountReason }))}
                    </p>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={applyCustomDiscount}
                    disabled={discountValue <= 0 || !discountReason.trim() || subtotal <= 0}
                    className="flex-1"
                  >
                    ✅ Terapkan
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      setDiscountValue(0);
                      setDiscountReason('');
                    }}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscountSystem;