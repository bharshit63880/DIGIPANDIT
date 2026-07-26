import React, { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const loadRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await api.get("/chat/rooms");
      setRooms(response.data.data);
      if (response.data.data.length) {
        setSelectedRoom((current) =>
          current ? response.data.data.find((room) => room._id === current._id) || response.data.data[0] : response.data.data[0]
        );
      } else {
        setSelectedRoom(null);
      }
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await api.get(`/chat/rooms/${selectedRoom._id}/messages`);
        setMessages(response.data.data);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedRoom]);

  const handleSend = async () => {
    if (!selectedRoom || !draft.trim()) return;
    await api.post(`/chat/rooms/${selectedRoom._id}/messages`, { content: draft.trim() });
    setMessages((current) => [
      ...current,
      {
        _id: Date.now().toString(),
        content: draft.trim(),
        sender: { name: "You", _id: user?._id },
      },
    ]);
    setDraft("");
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Pandits, astrologers, aur PanditJi assistant ke saath yahan se baat kar sakte hain.</Text>
        <View style={styles.topActions}>
          <Pressable style={styles.assistantButton} onPress={() => navigation.navigate("PanditJi")}>
            <Text style={styles.assistantButtonText}>Open PanditJi</Text>
          </Pressable>
          <Pressable style={styles.refreshButton} onPress={loadRooms}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </Pressable>
        </View>
      </Card>

      <View style={{ gap: 12 }}>
        {loadingRooms ? <ActivityIndicator size="small" color="#7a2e1d" /> : null}
        {rooms.map((room) => (
          <Pressable
            key={room._id}
            onPress={() => setSelectedRoom(room)}
            style={[styles.roomButton, selectedRoom?._id === room._id && styles.roomButtonActive]}
          >
            <Text style={[styles.roomTitle, selectedRoom?._id === room._id && { color: "#fff" }]}>
              {room.lastMessage || "Conversation"}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card>
        <Text style={styles.sectionTitle}>
          {selectedRoom ? "Selected conversation" : "Conversation select kijiye"}
        </Text>

        {!selectedRoom ? <Text style={styles.emptyText}>Booking ke saath linked chat room yahan show hoga.</Text> : null}
        {selectedRoom?.booking?.meetingLink ? (
          <Pressable style={styles.videoButton} onPress={() => Linking.openURL(selectedRoom.booking.meetingLink)}>
            <Text style={styles.videoButtonText}>Open video call</Text>
          </Pressable>
        ) : null}

        {loadingMessages ? <ActivityIndicator size="small" color="#7a2e1d" style={{ marginTop: 14 }} /> : null}

        {messages.map((message) => {
          const isMine = message.sender?._id === user?._id || message.sender?.name === "You";

          return (
            <View
              key={message._id}
              style={[
                styles.messageBubble,
                isMine ? styles.myMessageBubble : styles.otherMessageBubble,
              ]}
            >
              <Text style={[styles.messageSender, isMine && styles.myMessageSender]}>
                {isMine ? "You" : message.sender?.name || "Participant"}
              </Text>
              <Text style={[styles.messageCopy, isMine && styles.myMessageCopy]}>{message.content}</Text>
            </View>
          );
        })}

        <TextInput placeholder="Type your message" style={styles.input} value={draft} onChangeText={setDraft} />
        <Pressable style={[styles.primaryButton, !selectedRoom && styles.primaryButtonDisabled]} onPress={handleSend} disabled={!selectedRoom}>
          <Text style={styles.primaryButtonText}>Send</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 6, color: "#5e6167", lineHeight: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: "#202126" },
  emptyText: { marginTop: 12, color: "#5e6167", lineHeight: 21 },
  topActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  assistantButton: {
    flex: 1,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: "center",
  },
  assistantButtonText: { color: "#fff", fontWeight: "700" },
  refreshButton: {
    minWidth: 100,
    backgroundColor: "#202126",
    borderRadius: 18,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  refreshButtonText: { color: "#fff", fontWeight: "700" },
  roomButton: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
  },
  roomButtonActive: {
    backgroundColor: "#7a2e1d",
  },
  roomTitle: { color: "#202126", fontWeight: "700" },
  messageBubble: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    maxWidth: "92%",
  },
  myMessageBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#7a2e1d",
  },
  otherMessageBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f8f1e8",
  },
  messageSender: { color: "#7a2e1d", fontWeight: "700" },
  myMessageSender: { color: "#fff" },
  messageCopy: { marginTop: 6, color: "#5e6167", lineHeight: 21 },
  myMessageCopy: { color: "#fff" },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#e8dac9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
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
  videoButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#202126",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  videoButtonText: { color: "#fff", fontWeight: "700" },
});
