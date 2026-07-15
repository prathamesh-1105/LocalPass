import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal, SafeAreaView } from 'react-native';
import { Screen } from '@/components/Screen';
import { useColors } from '@/hooks/useColors';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { SearchableDropdown } from '@/components/SearchableDropdown';
import { useAuthStore } from '@/store/authStore';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: 'f1',
    question: 'How long does college verification take?',
    answer: 'College verification typically takes 2-3 working days. The student office verifies your registration details and bonafide before approving. You will receive a push notification once approved.',
  },
  {
    id: 'f2',
    question: 'What should I do if my application is rejected?',
    answer: 'If rejected, check the reason in the application details page. Tap "Edit & Resubmit" to correct only the flagged documents or route details and submit it again for verification.',
  },
  {
    id: 'f3',
    question: 'Can I change my travel route after pass generation?',
    answer: 'No, routes cannot be changed once a pass is active. You must wait for the current pass to expire or request the college registrar to cancel the active pass before submitting a new application.',
  },
  {
    id: 'f4',
    question: 'Why is the QR code refreshing on my pass?',
    answer: 'The digital pass includes a dynamic QR code that refreshes every 30 seconds for security. This prevents sharing and screenshots, ensuring only authorized pass-holders can travel.',
  },
];

const TICKET_CATEGORIES = [
  'Route Correction',
  'Bonafide Document Issue',
  'College Email Verification',
  'Incorrect Personal Details',
  'App Bug / Loading Error',
];

export default function HelpScreen() {
  const colors = useColors();
  const { user } = useAuthStore();

  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [ticketCategory, setTicketCategory] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [generatedTicketId, setGeneratedTicketId] = useState('');

  const toggleFaq = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleRaiseTicket = () => {
    if (!ticketCategory || !ticketSubject || !ticketDescription) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      alert('Please fill out all fields in the support form.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedTicketId(ticketId);
    setSuccessModalVisible(true);
  };

  const closeSuccessModal = () => {
    setSuccessModalVisible(false);
    setTicketCategory('');
    setTicketSubject('');
    setTicketDescription('');
  };

  return (
    <Screen scrollable style={{ backgroundColor: colors.background }}>
      <View style={styles.container}>
        
        {/* FAQs Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Frequently Asked Questions</Text>
          <View style={styles.faqList}>
            {FAQS.map((faq) => {
              const isExpanded = expandedFaq === faq.id;
              return (
                <View 
                  key={faq.id}
                  style={[styles.faqCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Pressable 
                    onPress={() => toggleFaq(faq.id)}
                    style={styles.faqQuestionRow}
                  >
                    <Text style={[styles.faqQuestion, { color: colors.foreground }]}>{faq.question}</Text>
                    <Feather 
                      name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={18} 
                      color={colors.mutedForeground} 
                    />
                  </Pressable>
                  {isExpanded && (
                    <Animated.View entering={FadeIn.duration(200)} style={styles.faqAnswerContainer}>
                      <Text style={[styles.faqAnswer, { color: colors.mutedForeground }]}>{faq.answer}</Text>
                    </Animated.View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Contact College helpdesk */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>College Support Desk</Text>
          <View style={[styles.supportDeskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.supportHeaderRow}>
              <Feather name="book-open" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.supportCollegeName, { color: colors.foreground }]} numberOfLines={1}>
                {user?.college || 'Your College Registrar Office'}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SupportRow icon="mail" label="Email Helpdesk" value="concessions@vjti.ac.in" />
            <SupportRow icon="phone" label="Office Phone" value="+91 22 2419 8200" />
            <SupportRow icon="clock" label="Timing" value="10:30 AM to 4:30 PM (Mon-Fri)" hideBorder />
          </View>
        </View>

        {/* Raise Ticket Form */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Raise a Support Ticket</Text>
          <View style={[styles.ticketForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            <SearchableDropdown
              label="Issue Category"
              placeholder="Select category..."
              options={TICKET_CATEGORIES}
              selectedValue={ticketCategory}
              onSelect={setTicketCategory}
              icon="tag"
            />

            <Input
              label="Subject"
              placeholder="Brief summary of the issue"
              value={ticketSubject}
              onChangeText={setTicketSubject}
              icon="edit"
            />

            <Input
              label="Detailed Description"
              placeholder="Provide context (application ID, wrong station, type errors...)"
              multiline
              value={ticketDescription}
              onChangeText={setTicketDescription}
              style={{ height: 100 }}
              icon="align-left"
            />

            <Button 
              title="Submit Ticket" 
              icon="send" 
              onPress={handleRaiseTicket} 
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </View>

      {/* Ticket Success Receipt Modal */}
      <Modal
        visible={successModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSuccessModal}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={{ width: 40 }} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Ticket Raised</Text>
            <Pressable onPress={closeSuccessModal} style={styles.closeBtn}>
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          <View style={styles.receiptContent}>
            <View style={[styles.receiptIconBox, { backgroundColor: colors.success + '20' }]}>
              <Feather name="check-circle" size={48} color={colors.success} />
            </View>
            <Text style={[styles.receiptTitle, { color: colors.foreground }]}>Support Ticket Logged</Text>
            <Text style={[styles.receiptText, { color: colors.mutedForeground }]}>
              Your request has been successfully filed with the student admin dashboard.
            </Text>

            <View style={[styles.receiptBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ReceiptRow label="Ticket ID" value={generatedTicketId} colors={colors} highlight />
              <ReceiptRow label="Category" value={ticketCategory} colors={colors} />
              <ReceiptRow label="Subject" value={ticketSubject} colors={colors} />
              <ReceiptRow label="Est. Resolution" value="2 Business Days" colors={colors} />
            </View>

            <Text style={[styles.receiptMutedText, { color: colors.mutedForeground }]}>
              An email notification has been sent to {user?.collegeEmail || user?.email} with status tracking details.
            </Text>

            <Button title="Done" onPress={closeSuccessModal} style={{ width: '100%', marginTop: 24 }} />
          </View>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}

function SupportRow({ icon, label, value, hideBorder }: { icon: any; label: string; value: string; hideBorder?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.supportRow, !hideBorder && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
      <View style={styles.supportIconWrap}>
        <Feather name={icon} size={14} color={colors.mutedForeground} />
      </View>
      <View style={styles.supportRowContent}>
        <Text style={[styles.supportLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.supportValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

function ReceiptRow({ label, value, colors, highlight }: { label: string; value: string; colors: any; highlight?: boolean }) {
  return (
    <View style={[styles.receiptRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[
        styles.receiptValue, 
        { color: colors.foreground },
        highlight && { color: colors.primary, fontWeight: '700' }
      ]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 32,
  },
  section: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 16,
    paddingLeft: 4,
  },
  faqList: {
    gap: 12,
  },
  faqCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    paddingRight: 16,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
  },
  supportDeskCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  supportHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportCollegeName: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  supportIconWrap: {
    marginRight: 12,
  },
  supportRowContent: {
    flex: 1,
  },
  supportLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  supportValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  ticketForm: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  /* Modal Styles */
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
  closeBtn: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  receiptContent: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    justifyContent: 'center',
  },
  receiptIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 8,
  },
  receiptText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  receiptBox: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  receiptLabel: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    maxWidth: '65%',
  },
  receiptMutedText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 20,
  },
});
