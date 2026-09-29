'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import {
  PersonalInfoForm,
  PreferencesSection,
  ProfileHeader,
  SecuritySection,
  type CurrentUserLocationResponse,
  type MyProfileData,
} from '@/components/features/profile';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import type { ForgotPasswordRequest, UpdateProfilePayload } from '@/types';
import ProfileLoading from './loading';
import { useCartStore } from '@/lib/stores/useCartStore';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user: authUser, logout, isAuthenticated, isLoading, setUser } = useAuthStore();

  const profileQuery = useQuery<MyProfileData>({
    queryKey: ['profile', 'me'],
    queryFn: () => userService.getMyProfile(),
    enabled: isAuthenticated,
  });

  const resolvedUser = useMemo<MyProfileData | null>(() => {
    if (profileQuery.data) {
      return profileQuery.data;
    }
    if (authUser) {
      return authUser;
    }
    return null;
  }, [authUser, profileQuery.data]);

  const resolvedUserId = resolvedUser?.id ?? '';
  const resolvedEmail = resolvedUser?.email ?? '';

  const currencyQuery = useQuery<{ currency: string }>({
    queryKey: ['profile', 'currency', resolvedUserId],
    queryFn: () => userService.getUserCurrency(resolvedUserId),
    enabled: isAuthenticated && Boolean(resolvedUserId),
  });

  const locationQuery = useQuery<CurrentUserLocationResponse>({
    queryKey: ['profile', 'location', resolvedUserId],
    queryFn: () => userService.getCurrentUserLocation(resolvedUserId),
    enabled: isAuthenticated && Boolean(resolvedUserId),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateProfile(payload),
    onSuccess: async (updatedProfile: MyProfileData) => {
      setUser(updatedProfile);
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Profile updated successfully');
    },
    onError: () => {
      toast.error('Failed to update profile');
    },
  });

  const updateCurrencyMutation = useMutation({
    mutationFn: (payload: { currency: string }) =>
      userService.updateUserCurrency(resolvedUserId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', 'currency', resolvedUserId] });
      await queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success('Currency updated successfully');
    },
    onError: () => {
      toast.error('Failed to update currency');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (payload: ForgotPasswordRequest) => authService.forgotPassword(payload),
    onSuccess: () => {
      toast.success('Password reset email sent');
    },
    onError: () => {
      toast.error('Failed to send reset password email');
    },
  });

  const handleProfileSubmit = async (payload: UpdateProfilePayload) => {
    await updateProfileMutation.mutateAsync(payload);
  };

  const handleCurrencySubmit = async (payload: { currency: string }) => {
    if (!resolvedUserId) {
      toast.error('Unable to resolve user profile');
      return;
    }
    await updateCurrencyMutation.mutateAsync(payload);
    await useCartStore.getState().refreshCartPrices();
    queryClient.clear();
  };

  const handleResetPassword = async () => {
    if (!resolvedEmail) {
      toast.error('Unable to resolve your email');
      return;
    }
    await forgotPasswordMutation.mutateAsync({ email: resolvedEmail });
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      queryClient.clear();
    }
  };

  if (isLoading || (profileQuery.isLoading && !authUser)) {
    return <ProfileLoading />;
  }

  if (!isAuthenticated || !resolvedUser) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <Shield size={48} className="text-muted-foreground" />
        <h2 className="text-xl font-bold">Sign in to view your profile</h2>
        <p className="text-muted-foreground text-sm">
          You need to be logged in to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="space-y-6">
        <ProfileHeader user={resolvedUser} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
          <PersonalInfoForm
            user={resolvedUser}
            onSubmit={handleProfileSubmit}
            isSubmitting={updateProfileMutation.isPending}
          />
          <PreferencesSection
            user={resolvedUser}
            location={locationQuery.data ?? null}
            initialCurrency={currencyQuery.data?.currency}
            onSaveCurrency={handleCurrencySubmit}
            isSubmitting={updateCurrencyMutation.isPending}
          />
        </div>

        <SecuritySection
          onResetPassword={handleResetPassword}
          isSubmitting={forgotPasswordMutation.isPending}
        />

        <Button
          variant="outline"
          size="lg"
          onClick={handleLogout}
          className="mx-auto flex w-full max-w-2xl border-error/30 text-error transition-all hover:border-error hover:bg-error/10 hover:text-error">
          <LogOut size={16} className="me-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
