import React, { useEffect, useMemo, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { api } from "../lib/api";

const STORAGE_KEY = "digipandit_mobile_panditji_messages";

const defaultMessages = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "Namaste. Main PanditJi hoon. Aap puja booking, astrology consultation, payment, store order, ya pandit onboarding ke baare me puchh sakte hain.",
    suggestions: ["Puja booking steps batao", "Astrology consultation kaise book karu?", "Store order kaise place karu?"],
  },
];

const quickPrompts = [
  "Puja booking steps batao",
  "Astrology consultation kaise book karu?",
  "Payment issue me kya karu?",
];

export function PanditJiScreen() {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(defaultMessages);
  const initialized = useRef(false);

  useEffect(() => {
    const restoreMessages = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          setMessages(JSON.parse(saved));
        }
      } finally {
        initialized.current = true;
      }
    };

    restoreMessages();
  }, []);

  useEffect(() => {
    if (!initialized.current) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const canSend = useMemo(() => draft.trim().length > 0 && !loading, [draft, loading]);

  const sendMessage = async (input) => {
    const content = input.trim();
    if (!content) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setLoading(true);

    try {
      const response = await api.post("/ai/panditji-chat", { message: content });
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.data.data.reply,
          suggestions: response.data.data.suggestions || [],
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "PanditJi abhi thoda vyast hain. Thodi der baad fir try kijiye.",
          suggestions: ["Book puja", "Astrology consultation", "Open store"],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = async () => {
    setMessages(defaultMessages);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>PanditJi</Text>
        <Text style={styles.subtitle}>AI spiritual assistant jo booking, astrology, payments aur store ke baare me turant help deta hai.</Text>
        <View style={styles.quickPromptRow}>
          {quickPrompts.map((prompt) => (
            <Pressable key={prompt} style={styles.quickPrompt} onPress={() => sendMessage(prompt)}>
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Conversation</Text>
          <Pressable onPress={resetConversation}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>

        <View style={styles.messagesWrap}>
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === "user" ? styles.userBubble : styles.assistantBubble,
              ]}
            >
              <Text style={[styles.messageText, message.role === "user" && styles.userMessageText]}>{message.content}</Text>
              {message.role === "assistant" && message.suggestions?.length ? (
                <View style={styles.suggestionWrap}>
                  {message.suggestions.map((suggestion) => (
                    <Pressable key={suggestion} style={styles.suggestionChip} onPress={() => sendMessage(suggestion)}>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ))}

          {loading ? (
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator color="#7a2e1d" />
              <Text style={styles.loadingText}>PanditJi soch rahe hain...</Text>
            </View>
          ) : null}
        </View>

        <TextInput
          placeholder="PanditJi se kuch poochhiye..."
          value={draft}
          onChangeText={setDraft}
          style={styles.input}
          multiline
        />
        <Pressable style={[styles.primaryButton, !canSend && styles.primaryButtonDisabled]} disabled={!canSend} onPress={() => sendMessage(draft)}>
          <Text style={styles.primaryButtonText}>Send</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 10, color: "#5e6167", lineHeight: 23 },
  quickPromptRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  quickPrompt: { backgroundColor: "#fff6ef", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  quickPromptText: { color: "#7a2e1d", fontWeight: "700", fontSize: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#202126" },
  resetText: { color: "#7a2e1d", fontWeight: "700" },
  messagesWrap: { gap: 12, marginTop: 16 },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    maxWidth: "92%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#7a2e1d",
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f8f1e8",
  },
  messageText: { color: "#202126", lineHeight: 22 },
  userMessageText: { color: "#fff" },
  suggestionWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  suggestionChip: { backgroundColor: "#ffffff", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 },
  suggestionText: { color: "#7a2e1d", fontWeight: "700", fontSize: 12 },
  loadingText: { marginTop: 8, color: "#5e6167" },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e8dac9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    minHeight: 72,
    textAlignVertical: "top",
  },
  primaryButton: {
    marginTop: 14,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
});
