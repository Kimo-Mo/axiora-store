'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useShippingRates } from '@/hooks/useShippingRates';

interface GovernorateSelectProps {
  value: string | null;
  onValueChange: (governorate: string) => void;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
}

export function GovernorateSelect({
  value,
  onValueChange,
  disabled,
  id,
  invalid,
}: GovernorateSelectProps) {
  const locale = useLocale();
  const t = useTranslations('checkout');
  const { rates, isLoading } = useShippingRates();

  const labels: Record<string, string> = {
    cairo: t('governorates.cairo'),
    giza: t('governorates.giza'),
    alexandria: t('governorates.alexandria'),
  };
  const label = (governorate: string) => labels[governorate] ?? governorate;

  const formatFee = (amount: number, days: number) => {
    const fee = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    const suffix = locale === 'ar' ? `ج.م · ${days} أيام` : `EGP · ${days} day${days === 1 ? '' : 's'}`;
    return `${fee} ${suffix}`;
  };

  return (
    <Select
      value={value ?? undefined}
      onValueChange={(v) => onValueChange(v)}
      disabled={disabled || isLoading}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <SelectTrigger id={id} className={invalid ? 'border-destructive' : undefined}>
        <SelectValue
          placeholder={
            isLoading
              ? t('address.governorate') + '...'
              : t('address.governorate')
          }
        />
      </SelectTrigger>
      <SelectContent>
        {rates.length === 0 ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">{t('errors.deliveryUnavailable')}</div>
        ) : (
          rates.map((rate) => (
            <SelectItem key={rate.id} value={rate.governorate}>
              <span className="flex items-center justify-between gap-3 w-full">
                <span>{label(rate.governorate)}</span>
                <span className="text-xs text-muted-foreground" dir="ltr">
                  {formatFee(rate.deliveryFee, rate.estimatedDays)}
                </span>
              </span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
