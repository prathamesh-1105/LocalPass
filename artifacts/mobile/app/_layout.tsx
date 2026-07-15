import { Stack } from 'expo-router';
import { useColors } from '@/hooks/useColors';

export default function AppLayout() {
  const colors = useColors();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
        headerShadowVisible: false,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="apply" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="application/[id]" options={{ title: 'Application Details' }} />
      <Stack.Screen name="certificate/[id]" options={{ title: 'Digital Certificate', presentation: 'modal' }} />
      <Stack.Screen name="search" options={{ headerShown: false, presentation: 'modal' }} />
      <Stack.Screen name="help" options={{ title: 'Help Center' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}
