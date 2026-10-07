'use client';

import { useTranslations } from 'next-intl';
import { Banknote } from 'lucide-react';
import { Label, RadioGroup, RadioGroupItem, Textarea } from '@/components/ui';

interface CheckoutPaymentSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

/**
 * Section 3 — payment method. COD is pre-selected and the only option this
 * phase; the step is extensible for additional methods in Phase 10 (FR-007).
 */
export function CheckoutPaymentSection({ notes, onNotesChange }: CheckoutPaymentSectionProps) {
  const t = useTranslations('checkout');

  return (
    <section className="space-y-4" aria-labelledby="checkout-section-payment">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          3
        </span>
        <h2 id="checkout-section-payment" className="text-lg font-semibold">
          {t('sections.payment')}
        </h2>
      </div>

      <RadioGroup value="COD" className="grid grid-cols-1 gap-3">
        <Label
          htmlFor="checkout-payment-cod"
          className="flex items-center justify-between p-4 border border-primary bg-primary/5 ring-1 ring-primary rounded-xl cursor-pointer transition-all"
        >
          <div className="flex items-center gap-4">
            <RadioGroupItem value="COD" id="checkout-payment-cod" className="h-5 w-5 ms-1" />
            <div className="flex items-center gap-3">
              <Banknote className="h-6 w-6 text-emerald-600" />
              <div>
                <div className="font-semibold text-sm">{t('payment.cod')}</div>
                <div className="text-xs text-muted-foreground">{t('payment.codDescription')}</div>
              </div>
            </div>
          </div>
        </Label>
      </RadioGroup>

      <div className="space-y-2">
        <Label htmlFor="checkout-delivery-notes">
          {t('confirmation.notes')}
          <span className="text-muted-foreground font-normal"> ({t('address.optional')})</span>
        </Label>
        <Textarea
          id="checkout-delivery-notes"
          rows={2}
          maxLength={500}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </section>
  );
}
