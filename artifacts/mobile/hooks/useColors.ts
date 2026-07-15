import { useColorScheme } from 'react-native';
import colors from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';

export function useColors() {
  const systemColorScheme = useColorScheme();
  const themePreference = useThemeStore((state) => state.theme);
  
  const activeTheme = themePreference === 'system' ? (systemColorScheme ?? 'light') : themePreference;
  const isDark = activeTheme === 'dark';

  return {
    ...colors[isDark ? 'dark' : 'light'],
    radius: colors.radius,
    isDark,
  };
}
