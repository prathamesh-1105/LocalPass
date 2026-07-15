/**
 * Semantic design tokens for the RailPass app.
 */

const colors = {
  light: {
    background: '#f8f9fc',
    foreground: '#0f172a',

    card: '#ffffff',
    cardForeground: '#0f172a',

    primary: '#2563eb', // Confident indigo/blue
    primaryForeground: '#ffffff',

    secondary: '#e2e8f0',
    secondaryForeground: '#1e293b',

    muted: '#f1f5f9',
    mutedForeground: '#64748b',

    accent: '#f59e0b', // Warm amber accent
    accentForeground: '#ffffff',

    destructive: '#ef4444',
    destructiveForeground: '#ffffff',

    success: '#10b981',
    successForeground: '#ffffff',

    warning: '#f59e0b',
    warningForeground: '#ffffff',

    border: '#e2e8f0',
    input: '#e2e8f0',
  },
  dark: {
    background: '#0f172a',
    foreground: '#f8f9fc',

    card: '#1e293b',
    cardForeground: '#f8f9fc',

    primary: '#3b82f6',
    primaryForeground: '#ffffff',

    secondary: '#334155',
    secondaryForeground: '#f1f5f9',

    muted: '#1e293b',
    mutedForeground: '#94a3b8',

    accent: '#fbbf24',
    accentForeground: '#ffffff',

    destructive: '#f87171',
    destructiveForeground: '#ffffff',

    success: '#34d399',
    successForeground: '#ffffff',

    warning: '#fbbf24',
    warningForeground: '#ffffff',

    border: '#334155',
    input: '#334155',
  },

  radius: 16, // Premium rounded feel
};

export default colors;
