'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { LogOut, Shield } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useUser, useSetUser, authKeys } from '@/hooks/useUser';
import { authService } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import { useRouter } from '@/i18n/navigation';
import type { ApiErrorBody } from '@/types/auth';
import ProfileLoading from './loading';

/**
 * Account overview.
 *
 * Scope note: the full account area — address book, order history — ships with the
 * orders phase. This page exists because the navbar links to it and the proxy
 * protects it, so it must work. It shows what the session actually holds and offers
 * the two profile mutations this phase defines: editing name/phone (FR-020) and
 * changing the password (FR-026).
 *
 * The Django-era version of this page offered currency switching, IP geolocation,
 * and a forgot-password email link. None of those have a backend behind them, and
 * password recovery by email is a documented MVP non-goal, so all three are gone.
 */
export default function ProfilePage() {
  const t = useTranslations('account');
  const tAuth = useTranslations('auth');
  const tErrors = useTranslations('errors');
  const queryClient = useQueryClient();
  const setUser = useSetUser();

  const { data: user, isLoading } = useUser();
  const [fullName, setFullName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const profileMutation = useMutation({
    mutationFn: () =>
      userService.updateProfile({
        ...(fullName !== null ? { fullName } : {}),
        ...(phone !== null ? { phone: phone === '' ? null : phone } : {}),
      }),
    onSuccess: (updated) => {
      setUser(updated);
      setFullName(null);
      setPhone(null);
      toast.success(t('profileUpdated'));
    },
    onError: (error) => {
      const body = (error as { response?: { data?: ApiErrorBody } })?.response?.data;
      toast.error(body?.error?.message ?? tErrors('tryAgainLater'));
    },
  });

  const passwordMutation = useMutation({
    mutationFn: () => authService.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      toast.success(t('passwordChanged'));
    },
    onError: (error) => {
      const body = (error as { response?: { data?: ApiErrorBody } })?.response?.data;
      toast.error(body?.error?.message ?? tErrors('tryAgainLater'));
    },
  });

  const router = useRouter();
  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // The server may already be gone; the local session must end either way.
    } finally {
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('axiora-auth-storage');
      }
      toast.success(tAuth('signOut'));
      router.push('/');
    }
  };

  if (isLoading) return <ProfileLoading />;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <Shield size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-bold">{t('signInRequired')}</h2>
        <p className="text-muted-foreground text-sm">{t('signInRequiredHint')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="space-y-6 max-w-2xl mx-auto px-4">
        <section className="space-y-2">
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <p className="text-muted-foreground text-sm">
            {t('username')}: {user.username}
          </p>
          <p className="text-muted-foreground text-sm">
            {t('memberSince')}: {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm">
            {t('phone')}: {user.phone ?? t('notSet')}{' '}
            {user.phone && (
              <span className={user.phoneVerified ? 'text-success' : 'text-muted-foreground'}>
                ({user.phoneVerified ? t('phoneVerified') : t('phoneUnverified')})
              </span>
            )}
          </p>
        </section>

        <section className="border-t border-border pt-6 space-y-4">
          <h2 className="text-lg font-semibold">{t('editProfile')}</h2>
          <Input
            value={fullName ?? user.fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={tAuth('namePlaceholder')}
            aria-label={tAuth('name')}
          />
          <Input
            value={phone ?? user.phone ?? ''}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={tAuth('phonePlaceholder')}
            aria-label={tAuth('phone')}
          />
          <Button
            onClick={() => profileMutation.mutate()}
            disabled={profileMutation.isPending}
            className="w-full rounded-2xl">
            {t('save')}
          </Button>
        </section>

        <section className="border-t border-border pt-6 space-y-4">
          <h2 className="text-lg font-semibold">{t('changePassword')}</h2>
          <Input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder={t('currentPassword')}
            aria-label={t('currentPassword')}
          />
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={t('newPassword')}
            aria-label={t('newPassword')}
          />
          <Button
            onClick={() => passwordMutation.mutate()}
            disabled={passwordMutation.isPending || !currentPassword || !newPassword}
            className="w-full rounded-2xl">
            {t('changePassword')}
          </Button>
        </section>

        <Button
          variant="outline"
          size="lg"
          onClick={handleLogout}
          className="w-full border-error/30 text-error transition-all hover:border-error hover:bg-error/10 hover:text-error">
          <LogOut size={16} className="me-2" />
          {tAuth('signOut')}
        </Button>
      </div>
    </div>
  );
}
