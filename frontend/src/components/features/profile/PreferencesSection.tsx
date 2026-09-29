'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Globe, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  CurrencyFormValues,
  CurrentUserLocationResponse,
  MyProfileData,
  SubmitCurrency,
} from './types';

const CURRENCY_OPTIONS = [
  'USD',
  'EUR',
  'GBP',
  'EGP',
  'CHF',
  'SEK',
  'NOK',
  'DKK',
  'PLN',
  'CZK',
  'HUF',
  'RON',
  'CAD',
  'BRL',
  'MXN',
  'ARS',
  'CLP',
  'JPY',
  'KRW',
  'CNY',
  'HKD',
  'TWD',
  'SGD',
  'MYR',
  'THB',
  'INR',
  'IDR',
  'PHP',
  'VND',
  'SAR',
  'AED',
  'QAR',
  'KWD',
  'BHD',
  'OMR',
  'TRY',
  'ZAR',
  'NGN',
] as const;
type CurrencyCode = (typeof CURRENCY_OPTIONS)[number];

const currencySchema = z.object({
  currency: z
    .string()
    .refine((value): value is CurrencyCode => CURRENCY_OPTIONS.includes(value as CurrencyCode), {
      message: 'Please select a valid currency',
    }),
});

interface PreferencesSectionProps {
  user: MyProfileData;
  location: CurrentUserLocationResponse | null;
  initialCurrency?: string;
  onSaveCurrency: SubmitCurrency;
  isSubmitting: boolean;
}

export function PreferencesSection({
  user,
  location,
  initialCurrency,
  onSaveCurrency,
  isSubmitting,
}: PreferencesSectionProps) {
  const form = useForm<CurrencyFormValues>({
    resolver: zodResolver(currencySchema),
    defaultValues: {
      currency: (initialCurrency || user.settings?.currency || 'USD').toUpperCase(),
    },
  });
  const selectedCurrency = useWatch({
    control: form.control,
    name: 'currency',
  });

  useEffect(() => {
    const nextCurrency = (initialCurrency || user.settings?.currency || 'USD').toUpperCase();
    form.reset({ currency: nextCurrency });
  }, [form, initialCurrency, user.settings?.currency]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSaveCurrency({
      currency: values.currency,
    });
  });

  return (
    <Card className="border-border bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Globe className="text-primary" size={18} />
          Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Currency</label>
            <Select
              value={selectedCurrency}
              onValueChange={(value) => form.setValue('currency', value, { shouldValidate: true })}
              disabled={isSubmitting}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.currency && (
              <p className="text-sm text-destructive">{form.formState.errors.currency.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="me-2 animate-spin" />
                Saving
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </form>

        <div className="rounded-lg border border-border bg-background/50 p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <MapPin size={14} className="text-primary" />
            Current Location
          </div>
          <p className="text-sm text-muted-foreground">
            {location?.current?.city && location.current.country
              ? `${location.current.city}, ${location.current.country}`
              : 'Not available'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
