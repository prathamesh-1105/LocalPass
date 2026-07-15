import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, Image, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';
import { useDocuments } from '@/services/api';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface DocItem {
  id: string;
  type: string;
  name: string;
  size: string;
  date: string;
  icon: keyof typeof Feather.glyphMap;
  placeholderImage: string;
}

export default function DocumentVaultScreen() {
  const colors = useColors();
  const { data: serverDocs, isLoading } = useDocuments();
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

  // Local document templates merged with server docs to ensure Aadhaar and Student Photo are populated
  const docVaultItems: DocItem[] = [
    {
      id: 'doc1',
      type: 'College ID Card',
      name: serverDocs?.[0]?.name || 'college_id_front.jpg',
      size: '1.4 MB',
      date: '01 Jul 2026',
      icon: 'credit-card',
      placeholderImage: 'https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'doc2',
      type: 'Bonafide Certificate',
      name: serverDocs?.[1]?.name || 'bonafide_cert_2026.pdf',
      size: '1.2 MB',
      date: '01 Jul 2026',
      icon: 'file-text',
      placeholderImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'doc3',
      type: 'Aadhaar Card',
      name: 'aadhaar_card_uidai.jpg',
      size: '950 KB',
      date: '15 Jul 2026',
      icon: 'shield',
      placeholderImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 'doc4',
      type: 'Student Photo',
      name: 'passport_photo.png',
      size: '420 KB',
      date: '15 Jul 2026',
      icon: 'image',
      placeholderImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    },
  ];

  const handlePreview = (doc: DocItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedDoc(doc);
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <Stack.Screen options={{ title: 'Document Vault' }} />

      <View style={styles.container}>
        <View style={styles.vaultHeader}>
          <Feather name="shield" size={22} color={colors.primary} style={{ marginRight: 8 }} />
          <Text style={[styles.vaultIntro, { color: colors.mutedForeground }]}>
            All your concession verification documents are safely stored in your digital vault.
          </Text>
        </View>

        <FlatList
          data={docVaultItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeIn.delay(index * 100).springify()}>
              <Pressable
                style={({ pressed }) => [
                  styles.docCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => handlePreview(item)}
              >
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '12' }]}>
                  <Feather name={item.icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.docInfo}>
                  <Text style={[styles.docType, { color: colors.foreground }]}>{item.type}</Text>
                  <Text style={[styles.docName, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.docMeta, { color: colors.mutedForeground }]}>
                    Size: {item.size} • Uploaded: {item.date}
                  </Text>
                </View>
                <Feather name="eye" size={18} color={colors.mutedForeground} style={styles.viewIcon} />
              </Pressable>
            </Animated.View>
          )}
        />
      </View>

      {/* Document Preview Modal */}
      <Modal
        visible={!!selectedDoc}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedDoc(null)}
      >
        {selectedDoc && (
          <View style={styles.modalOverlay}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedDoc.type}</Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedDoc(null);
                  }}
                  style={styles.closeBtn}
                >
                  <Feather name="x" size={24} color="#fff" />
                </Pressable>
              </View>

              <View style={styles.previewContainer}>
                {selectedDoc.icon === 'file-text' ? (
                  // PDF Mock Preview
                  <View style={styles.pdfPlaceholder}>
                    <Feather name="file-text" size={64} color="#0284c7" style={{ marginBottom: 16 }} />
                    <Text style={styles.pdfName}>{selectedDoc.name}</Text>
                    <Text style={styles.pdfInfo}>Mock PDF Document Preview</Text>
                    <Text style={styles.pdfDetails}>Pages: 1 • Size: {selectedDoc.size}</Text>
                  </View>
                ) : (
                  // Image Preview
                  <Image source={{ uri: selectedDoc.placeholderImage }} style={styles.previewImage} resizeMode="contain" />
                )}
              </View>

              <View style={styles.modalFooter}>
                <Feather name="lock" size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                <Text style={styles.footerText}>Encrypted & visible inside the app only</Text>
              </View>
            </SafeAreaView>
          </View>
        )}
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(2, 132, 199, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  vaultIntro: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  list: {
    gap: 16,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    position: 'relative',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
    paddingRight: 24,
  },
  docType: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  docName: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 12,
  },
  viewIcon: {
    position: 'absolute',
    right: 16,
  },
  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  closeBtn: {
    padding: 8,
  },
  previewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  pdfPlaceholder: {
    width: '100%',
    height: '80%',
    backgroundColor: '#1e293b',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pdfName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  pdfInfo: {
    color: '#94a3b8',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 4,
  },
  pdfDetails: {
    color: '#475569',
    fontSize: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  footerText: {
    color: '#94a3b8',
    fontSize: 13,
  },
});
