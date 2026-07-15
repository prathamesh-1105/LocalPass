import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function InitialRoute() {
  const { user, hasSeenOnboarding } = useAuthStore();

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  if (hasSeenOnboarding) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(auth)/onboarding" />;
}
