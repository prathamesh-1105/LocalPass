import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import { useThemeStore } from '@/store/themeStore';

export default function SettingsScreen() {
  const colors = useColors();
  const { theme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Screen scrollable>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>PREFERENCES</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow 
            icon="moon" 
            label="Theme" 
            value={theme.charAt(0).toUpperCase() + theme.slice(1)} 
            onPress={cycleTheme} 
          />
          <SettingRow icon="globe" label="Language" value="English" onPress={() => {}} hideBorder />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>SECURITY</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="smile" label="Face ID / Biometrics" value="Enabled" onPress={() => {}} />
          <SettingRow icon="lock" label="Change Password" onPress={() => {}} hideBorder />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="info" label="Terms of Service" onPress={() => {}} />
          <SettingRow icon="shield" label="Privacy Policy" onPress={() => {}} />
          <SettingRow icon="smartphone" label="App Version" value="1.0.0" onPress={() => {}} hideBorder />
        </View>
      </View>
    </Screen>
  );
}

function SettingRow({ icon, label, value, onPress, hideBorder }: any) {
  const colors = useColors();
  return (
    <Pressable 
      onPress={onPress}
      style={({ pressed }) => [
        styles.row, 
        !hideBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.muted }
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      {value && <Text style={[styles.value, { color: colors.mutedForeground }]}>{value}</Text>}
      {!value && <Feather name="chevron-right" size={20} color={colors.mutedForeground} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    padding: 24,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingLeft: 8,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 15,
  },
});
