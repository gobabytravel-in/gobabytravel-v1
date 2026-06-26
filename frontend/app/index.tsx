import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Image,
  Keyboard,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme, Space, Radius, Font } from '../constants/Theme';
import { trackScreenView } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const COMMAND_CHIPS = [
  { label: 'Plan A Trip', icon: 'map-outline', message: 'I want to plan a trip. Can you help me get started?', color: Theme.gold },
  { label: 'Find Flights', icon: 'airplane-outline', message: 'Help me find flights. Where should I start?', color: Theme.primary },
  { label: 'Hotels', icon: 'bed-outline', message: 'I need help finding the right hotel for my trip.', color: Theme.teal },
  { label: 'Visa Help', icon: 'document-text-outline', message: 'I need visa assistance. Can you guide me?', color: Theme.coral },
  { label: 'Transport', icon: 'car-outline', message: 'I need transport options for my destination.', color: Theme.orange },
  { label: 'Travel Health', icon: 'medkit-outline', message: 'I need travel health advice before my trip.', color: '#a78bfa' },
];

const WELCOME_MESSAGE = `Welcome to GoBaby AI — your personal travel concierge.

I'm here to help you discover the world, plan your perfect trip, navigate visas, and travel with confidence.

**Where would you like to go today?**`;

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAI]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={14} color={Theme.primary} />
        </View>
      )}
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAI]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function AIScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveDestination, setSaveDestination] = useState('');
  const [savedId, setSavedId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    trackScreenView('ai_concierge');
    setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE }]);
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    Keyboard.dismiss();
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text.trim() };
    const history = messages.filter(m => m.id !== 'welcome').map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setConversationStarted(true);
    scrollToBottom();

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), history }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'I had trouble responding. Please try again.',
      };
      setMessages(prev => [...prev, aiMsg]);

      // Auto-update saved conversation if one exists
      if (savedId && user) {
        const allMsgs = [...history, { role: 'user', content: text.trim() }, { role: 'assistant', content: data.reply }];
        const inserts = allMsgs.map((m, i) => ({
          conversation_id: savedId,
          role: m.role,
          content: m.content,
        }));
        // Just append new messages (upsert not needed — append only)
        await supabase.from('conversation_messages').insert([
          { conversation_id: savedId, role: 'user', content: text.trim() },
          { conversation_id: savedId, role: 'assistant', content: data.reply },
        ]);
        await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', savedId);
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Connection issue — please check your internet and try again.' },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [messages, loading, scrollToBottom, savedId, user]);

  const openSaveModal = () => {
    if (!user) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sign in on the Profile tab to save your conversations.',
      }]);
      return;
    }
    // Auto-suggest title from first user message
    const firstUser = messages.find(m => m.role === 'user' && m.id !== 'welcome');
    setSaveTitle(firstUser?.content?.slice(0, 60) || 'Travel Planning');
    setSaveDestination('');
    setSaveModal(true);
  };

  const handleSave = async () => {
    if (!user || !saveTitle.trim()) return;
    setSaving(true);
    try {
      const { data: conv, error } = await supabase.from('conversations').insert({
        user_id: user.id,
        title: saveTitle.trim(),
        destination: saveDestination.trim() || null,
      }).select().single();

      if (!error && conv) {
        setSavedId(conv.id);
        // Insert all non-welcome messages
        const msgs = messages
          .filter(m => m.id !== 'welcome')
          .map(m => ({ conversation_id: conv.id, role: m.role, content: m.content }));
        if (msgs.length > 0) {
          await supabase.from('conversation_messages').insert(msgs);
        }
        setSaveModal(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: '✓ Conversation saved to My Trips.',
        }]);
      }
    } catch (e) {
      setSaveModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleNewChat = () => {
    setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE }]);
    setConversationStarted(false);
    setSavedId(null);
    setSaveTitle('');
    setSaveDestination('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerRight}>
          {conversationStarted && (
            <>
              <Pressable
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                onPress={openSaveModal}
                disabled={!!savedId}
              >
                <Ionicons name={savedId ? 'checkmark-circle' : 'bookmark-outline'} size={20} color={savedId ? Theme.teal : Theme.textSubtle} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
                onPress={handleNewChat}
              >
                <Ionicons name="create-outline" size={20} color={Theme.textSubtle} />
              </Pressable>
            </>
          )}
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={10} color={Theme.primary} />
            <Text style={styles.aiBadgeText}>AI CONCIERGE</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
          {loading && (
            <View style={[styles.bubbleRow, styles.bubbleRowAI]}>
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color={Theme.primary} />
              </View>
              <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
                <ActivityIndicator size="small" color={Theme.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Travel OS Command Center */}
        {!conversationStarted && (
          <View style={styles.commandCenter}>
            <Text style={styles.commandCenterLabel}>TRAVEL OS COMMAND CENTER</Text>
            <View style={styles.chipGrid}>
              {COMMAND_CHIPS.map(chip => (
                <Pressable
                  key={chip.label}
                  style={({ pressed }) => [styles.chip, { borderColor: chip.color + '44' }, pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] }]}
                  onPress={() => sendMessage(chip.message)}
                >
                  <View style={[styles.chipIcon, { backgroundColor: chip.color + '18' }]}>
                    <Ionicons name={chip.icon as any} size={16} color={chip.color} />
                  </View>
                  <Text style={[styles.chipLabel, { color: chip.color }]}>{chip.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask me anything about travel..."
            placeholderTextColor={Theme.textSubtle}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled, pressed && { opacity: 0.8 }]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color={!input.trim() || loading ? Theme.textSubtle : '#fff'} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Save Modal */}
      <Modal visible={saveModal} transparent animationType="slide" onRequestClose={() => setSaveModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Save Conversation</Text>
              <Pressable onPress={() => setSaveModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={Theme.textSubtle} />
              </Pressable>
            </View>
            <Text style={styles.modalLabel}>TITLE</Text>
            <TextInput
              style={styles.modalInput}
              value={saveTitle}
              onChangeText={setSaveTitle}
              placeholder="e.g. Bali trip planning"
              placeholderTextColor={Theme.textSubtle}
              autoFocus
            />
            <Text style={styles.modalLabel}>DESTINATION (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={saveDestination}
              onChangeText={setSaveDestination}
              placeholder="e.g. Bali, Indonesia"
              placeholderTextColor={Theme.textSubtle}
            />
            <Pressable
              style={({ pressed }) => [styles.modalSaveBtn, pressed && { opacity: 0.85 }, (!saveTitle.trim() || saving) && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={!saveTitle.trim() || saving}
            >
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.modalSaveBtnText}>Save to My Trips</Text>}
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.base,
    paddingVertical: Space.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.border,
  },
  logo: { width: 140, height: 36 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Theme.whiteAlpha06,
    alignItems: 'center', justifyContent: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    backgroundColor: Theme.primary + '18',
    borderWidth: 1,
    borderColor: Theme.primary + '44',
  },
  aiBadgeText: { fontSize: 9, fontWeight: '800', color: Theme.primary, letterSpacing: 1.2 },

  messages: { flex: 1 },
  messagesContent: { padding: Space.base, paddingBottom: Space.xl, gap: Space.md },

  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Space.sm },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAI: { justifyContent: 'flex-start' },
  aiAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Theme.primary + '18',
    borderWidth: 1,
    borderColor: Theme.primary + '44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: Space.base,
    paddingVertical: Space.md,
    borderRadius: Radius.lg,
  },
  bubbleUser: {
    backgroundColor: Theme.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAI: {
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    borderBottomLeftRadius: 4,
  },
  typingBubble: { paddingVertical: Space.md, paddingHorizontal: Space.xl },
  bubbleText: { fontSize: Font.sm, lineHeight: 20 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAI: { color: Theme.text },

  commandCenter: {
    paddingHorizontal: Space.base,
    paddingBottom: Space.md,
  },
  commandCenterLabel: {
    fontSize: Font.xxs,
    fontWeight: '700',
    color: Theme.textSubtle,
    letterSpacing: 1.5,
    marginBottom: Space.sm,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Space.md,
    paddingVertical: Space.sm,
    borderRadius: Radius.pill,
    backgroundColor: Theme.surface,
    borderWidth: 1,
  },
  chipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontSize: Font.xs, fontWeight: '700' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Space.sm,
    paddingHorizontal: Space.base,
    paddingVertical: Space.md,
    borderTopWidth: 1,
    borderTopColor: Theme.border,
    backgroundColor: Theme.bg,
  },
  input: {
    flex: 1,
    backgroundColor: Theme.surface,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.base,
    paddingVertical: Space.md,
    color: Theme.text,
    fontSize: Font.sm,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Theme.whiteAlpha08 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Theme.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Space.xl,
    gap: Space.md,
    borderWidth: 1,
    borderColor: Theme.border,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Space.sm },
  modalTitle: { fontSize: Font.lg, fontWeight: '800', color: Theme.text },
  modalLabel: { fontSize: Font.xxs, fontWeight: '700', color: Theme.textSubtle, letterSpacing: 1.5 },
  modalInput: {
    backgroundColor: Theme.elevated,
    borderWidth: 1,
    borderColor: Theme.border,
    borderRadius: Radius.md,
    paddingHorizontal: Space.base,
    paddingVertical: Space.md,
    color: Theme.text,
    fontSize: Font.sm,
  },
  modalSaveBtn: {
    backgroundColor: Theme.primary,
    paddingVertical: Space.md,
    borderRadius: Radius.pill,
    alignItems: 'center',
    marginTop: Space.sm,
  },
  modalSaveBtnText: { color: '#fff', fontWeight: '700', fontSize: Font.base },
});
