import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { Button } from "../components/Button";
import { useSelector } from "react-redux";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const token = useSelector((state) => state.auth.token);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const loadRooms = async () => {
      const response = await api.get("/chat/rooms");
      setRooms(response.data.data);
      if (response.data.data.length) {
        const requestedRoomId = searchParams.get("room");
        const requestedRoom = requestedRoomId
          ? response.data.data.find((room) => room._id === requestedRoomId)
          : null;
        setSelectedRoom(requestedRoom || response.data.data[0]);
      }
    };

    loadRooms();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedRoom) return;

    const loadMessages = async () => {
      const response = await api.get(`/chat/rooms/${selectedRoom._id}/messages`);
      setMessages(response.data.data);
    };

    loadMessages();
  }, [selectedRoom]);

  useEffect(() => {
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      auth: { token },
    });

    socket.on("connect", () => {
      if (selectedRoom?._id) {
        socket.emit("chat:join-room", selectedRoom._id);
      }
    });

    socket.on("chat:new-message", (message) => {
      setMessages((current) => [...current, message]);
    });

    return () => socket.disconnect();
  }, [token, selectedRoom?._id]);

  const counterpartLabel = useMemo(() => {
    return (room) => room.participants?.find((participant) => participant.role !== "USER")?.name || "Conversation";
  }, []);

  const handleSend = async () => {
    if (!selectedRoom || !draft.trim()) return;

    await api.post(`/chat/rooms/${selectedRoom._id}/messages`, { content: draft.trim() });
    setDraft("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-[36px] bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-bold text-brand-ink">Chat inbox</h1>
        <div className="mt-6 space-y-3">
          {rooms.map((room) => (
            <button
              key={room._id}
              onClick={() => setSelectedRoom(room)}
              className={`w-full rounded-[22px] p-4 text-left ${
                selectedRoom?._id === room._id ? "bg-brand-maroon text-white" : "bg-brand-cream text-brand-ink"
              }`}
            >
              <p className="font-bold">{counterpartLabel(room)}</p>
              <p className="mt-1 text-sm opacity-75">{room.lastMessage || "No messages yet. Say hello to begin."}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-[36px] bg-white p-6 shadow-soft">
        <div className="flex h-[65vh] flex-col">
          {selectedRoom?.booking?.meetingLink ? (
            <div className="mb-4 flex items-center justify-between gap-4 rounded-[22px] bg-brand-cream p-4">
              <div>
                <p className="text-sm font-bold text-brand-ink">Video consultation room ready</p>
                <p className="mt-1 text-sm text-brand-ink/65">{selectedRoom.booking.serviceName}</p>
              </div>
              <Link to={`/video-call/${selectedRoom.booking._id}`}>
                <Button>Open consultation room</Button>
              </Link>
            </div>
          ) : null}

          <div className="flex-1 space-y-3 overflow-y-auto pr-2">
            {messages.map((message) => (
              <div key={message._id} className="rounded-[22px] bg-brand-cream p-4">
                <p className="text-sm font-bold text-brand-clay">{message.sender?.name || "You"}</p>
                <p className="mt-2 text-sm leading-7 text-brand-ink">{message.content}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="flex-1 rounded-full border border-brand-sand px-4 py-3 outline-none"
              placeholder="Type and send your message"
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
