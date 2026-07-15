import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useColors } from '@/hooks/useColors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function AppLayout() {
  const colors = useColors();

  return (
    <QueryClientProvider client={queryClient}>
      <RootStack colors={colors} />
    </QueryClientProvider>
  );
}

function RootStack({ colors }: { colors: ReturnType<typeof useColors> }) {
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
