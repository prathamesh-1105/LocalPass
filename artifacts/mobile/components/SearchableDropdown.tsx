import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal,
  TextInput,
  FlatList,
  SafeAreaView,
  ViewStyle,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  containerStyle?: ViewStyle;
}

export function SearchableDropdown({
  label,
  placeholder,
  options,
  selectedValue,
  onSelect,
  error,
  icon,
  containerStyle,
}: SearchableDropdownProps) {
  const colors = useColors();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(item);
    setSearchQuery('');
    setModalVisible(false);
  };

  const handleOpen = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setModalVisible(true);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: colors.foreground }]}>
          {label}
        </Text>
      )}
      <Pressable
        style={[
          styles.input,
          {
            backgroundColor: colors.background,
            borderColor: error ? colors.destructive : colors.border,
            borderRadius: colors.radius,
            paddingLeft: icon ? 44 : 16,
          },
        ]}
        onPress={handleOpen}
      >
        {icon && (
          <Feather
            name={icon}
            size={20}
            color={colors.mutedForeground}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.valueText,
            { color: selectedValue ? colors.foreground : colors.mutedForeground },
          ]}
          numberOfLines={1}
        >
          {selectedValue || placeholder}
        </Text>
        <Feather
          name="chevron-down"
          size={18}
          color={colors.mutedForeground}
          style={styles.arrow}
        />
      </Pressable>
      {error && (
        <Text style={[styles.error, { color: colors.destructive }]}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Pressable
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
            >
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Select {label}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <View style={styles.searchSection}>
            <View style={[styles.searchBar, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
              <Feather
                name="search"
                size={18}
                color={colors.mutedForeground}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder={`Search ${label.toLowerCase()}...`}
                placeholderTextColor={colors.mutedForeground}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Feather
                    name="x-circle"
                    size={16}
                    color={colors.mutedForeground}
                    style={styles.clearSearchIcon}
                  />
                </Pressable>
              )}
            </View>
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = item === selectedValue;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={({ pressed }) => [
                    styles.itemRow,
                    { borderBottomColor: colors.border },
                    isSelected && { backgroundColor: colors.primary + '10' },
                    pressed && { backgroundColor: colors.muted },
                  ]}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: colors.foreground },
                      isSelected && { color: colors.primary, fontWeight: '600' },
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="info" size={32} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  No options match your search.
                </Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    fontFamily: 'Inter_500Medium',
  },
  input: {
    height: 52,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 40,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 14,
  },
  valueText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  arrow: {
    position: 'absolute',
    right: 14,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  searchSection: {
    padding: 16,
  },
  searchBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    height: '100%',
    padding: 0, // Reset default padding
  },
  clearSearchIcon: {
    marginLeft: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  itemText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
