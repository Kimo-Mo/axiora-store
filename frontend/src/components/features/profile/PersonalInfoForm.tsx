'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Mail, Phone, User, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { MyProfileData, PersonalInfoFormValues, SubmitPersonalInfo } from './types';

const personalInfoSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
  phone: z.string().trim().max(30),
});

interface PersonalInfoFormProps {
  user: MyProfileData;
  onSubmit: SubmitPersonalInfo;
  isSubmitting: boolean;
}

export function PersonalInfoForm({ user, onSubmit, isSubmitting }: PersonalInfoFormProps) {
  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      full_name: user.full_name ?? '',
      phone: user.profile?.phone ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      full_name: user.full_name ?? '',
      phone: user.profile?.phone ?? '',
    });
  }, [form, user.full_name, user.profile?.phone]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({
      full_name: values.full_name,
      profile: {
        phone: values.phone || undefined,
      },
    });
  });

  return (
    <Card className="border-border bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <UserCircle2 className="text-primary" size={18} />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute top-1/2 start-3 -translate-y-1/2"
              />
              <Input
                {...form.register('full_name')}
                className="ps-9"
                placeholder="Your full name"
                disabled={isSubmitting}
              />
            </div>
            {form.formState.errors.full_name && (
              <p className="text-sm text-destructive">{form.formState.errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Phone Number</label>
            <div className="relative">
              <Phone
                size={16}
                className="pointer-events-none absolute top-1/2 start-3 -translate-y-1/2"
              />
              <Input
                {...form.register('phone')}
                className="ps-9"
                placeholder="Your phone number"
                disabled={isSubmitting}
              />
            </div>
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Username</label>
            <Input value={user.username ?? ''} disabled />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute top-1/2 start-3 -translate-y-1/2"
              />
              <Input value={user.email ?? ''} className="ps-9" disabled />
            </div>
          </div>

          <div className="lg:col-span-2">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="me-2 animate-spin" />
                  Saving
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
