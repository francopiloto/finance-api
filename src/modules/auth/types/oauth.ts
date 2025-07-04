import { AuthProvider } from '../auth.enums';

export type OAuthProfile = {
  provider: AuthProvider;
  providerUserId: string;
  email?: string;
  avatarUrl?: string;
};
