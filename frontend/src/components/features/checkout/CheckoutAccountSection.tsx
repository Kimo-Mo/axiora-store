'use client';

import { useTranslations } from 'next-intl';
import { Input, Label } from '@/components/ui';
import { useUser } from '@/hooks/useUser';

interface CheckoutAccountSectionProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  phoneError?: string;
}

/**
 * Section 1 — account confirmation + delivery contact phone. The phone
 * defaults to the selected address's recipient phone and is editable before
 * placing (FR-014, clarification Q4).
 */
export function CheckoutAccountSection({
  phone,
  onPhoneChange,
  phoneError,
}: CheckoutAccountSectionProps) {
  const t = useTranslations('checkout');
  const { data: user } = useUser();

  if (!user) return null;

  return (
    <section className="space-y-4" aria-labelledby="checkout-section-account">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          1
        </span>
        <h2 id="checkout-section-account" className="text-lg font-semibold">
          {t('sections.account')}
        </h2>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="text-sm space-y-1">
          <p className="text-muted-foreground">{t('account.customerLabel')}</p>
          <p className="font-medium">
            {user.fullName} · {user.email}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="checkout-contact-phone">{t('account.phoneLabel')}</Label>
          <Input
            id="checkout-contact-phone"
            type="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+20 1XX XXX XXXX"
          />
          <p className="text-xs text-muted-foreground">{t('account.phoneHint')}</p>
          {phoneError && <p className="text-sm text-destructive">{phoneError}</p>}
        </div>
      </div>
    </section>
  );
}
