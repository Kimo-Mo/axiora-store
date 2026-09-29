import type { AuthUser, UpdateProfilePayload } from '@/types';

export type ProfileLocation = {
  country: string | null;
  city: string | null;
  ip?: string | null;
};

export type CurrentUserLocationResponse = {
  current: ProfileLocation;
  'in-settings': Omit<ProfileLocation, 'ip'>;
  'in-profile'?: Omit<ProfileLocation, 'ip'>;
};

export type UserProfileDetails = {
  phone?: string | null;
  country?: string | null;
  city?: string | null;
};

export type UserSettingsDetails = {
  language_preference?: string;
  mode?: string;
  location?: string | null;
  currency?: string;
};

export type MyProfileData = AuthUser & {
  profile?: UserProfileDetails | null;
  settings?: UserSettingsDetails | null;
};

export type PersonalInfoFormValues = {
  full_name: string;
  phone: string;
};

export type CurrencyFormValues = {
  currency: string;
};

export type SubmitPersonalInfo = (payload: UpdateProfilePayload) => Promise<void>;
export type SubmitCurrency = (payload: { currency: string }) => Promise<void>;
