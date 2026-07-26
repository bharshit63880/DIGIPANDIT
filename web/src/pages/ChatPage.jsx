import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { Link, useSearchParams } from "react-router-dom";
import { CalendarDays, MessageCircle, Send } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true); setError("");
        const response = await api.get("/chat/rooms");
        const nextRooms = response.data.data || [];
        setRooms(nextRooms);
        const requestedRoomId = searchParams.get("room");
        setSelectedRoom(requestedRoomId ? nextRooms.find((room) => room._id === requestedRoomId) || nextRooms[0] || null : nextRooms[0] || null);
      } catch (requestError) { setError(requestError.message || "चैट इनबॉक्स लोड नहीं हो सका।"); }
      finally { setLoading(false); }
    };
    loadRooms();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedRoom) { setMessages([]); return; }
    api.get(`/chat/rooms/${selectedRoom._id}/messages`).then((response) => setMessages(response.data.data || [])).catch((requestError) => setError(requestError.message || "संदेश लोड नहीं हो सके।"));
  }, [selectedRoom]);

  useEffect(() => {
    if (!token || !selectedRoom?._id) return undefined;
    const socket = io(SOCKET_URL, { auth: { token } });
    socket.on("connect", () => socket.emit("chat:join-room", selectedRoom._id));
    socket.on("chat:new-message", (message) => setMessages((current) => current.some((entry) => entry._id === message._id) ? current : [...current, message]));
    socket.on("chat:error", (payload) => setError(payload?.message || "संदेश नहीं भेजा जा सका।"));
    return () => socket.disconnect();
  }, [token, selectedRoom?._id]);

  const counterpartLabel = useMemo(() => (room) => room.participants?.find((participant) => participant.role !== "USER")?.name || "परामर्श", []);
  const handleSend = async () => {
    if (!selectedRoom || !draft.trim() || sending) return;
    try {
      setSending(true); setError("");
      const response = await api.post(`/chat/rooms/${selectedRoom._id}/messages`, { content: draft.trim() });
      const message = response.data.data;
      if (message) setMessages((current) => current.some((entry) => entry._id === message._id) ? current : [...current, message]);
      setDraft("");
    } catch (requestError) { setError(requestError.message || "संदेश नहीं भेजा जा सका।"); }
    finally { setSending(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="rounded-[30px] bg-white p-5 shadow-soft">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-blush text-brand-maroon"><MessageCircle className="h-5 w-5" /></div><div><p className="eyebrow !text-brand-clay">संदेश</p><h1 className="text-2xl font-bold text-brand-ink">चैट इनबॉक्स</h1></div></div>
        <div className="mt-5 space-y-2">
          {rooms.map((room) => <button key={room._id} onClick={() => setSelectedRoom(room)} className={`w-full rounded-2xl p-4 text-left ${selectedRoom?._id === room._id ? "bg-brand-maroon text-white" : "bg-brand-cream text-brand-ink"}`}><p className="font-bold">{counterpartLabel(room)}</p><p className="mt-1 line-clamp-2 text-sm opacity-75">{room.lastMessage || "अभी कोई संदेश नहीं"}</p></button>)}
          {!loading && !rooms.length ? <p className="rounded-2xl bg-brand-cream p-4 text-sm leading-6 text-brand-ink/70">आपकी कोई सक्रिय बातचीत नहीं है। पहले परामर्श या पंडित बुकिंग शुरू करें।</p> : null}
        </div>
      </aside>

      <section className="rounded-[30px] bg-white p-5 shadow-soft">
        {!selectedRoom ? <div className="grid min-h-[520px] place-items-center text-center"><div className="max-w-md"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-blush text-brand-maroon"><MessageCircle className="h-7 w-7" /></div><h2 className="mt-5 text-3xl font-bold text-brand-ink">बातचीत शुरू करें</h2><p className="mt-3 text-sm leading-7 text-brand-ink/65">चैट एक सक्रिय ज्योतिष परामर्श या पंडित बुकिंग से बनती है। इससे आपकी बातचीत सही विशेषज्ञ से जुड़ी रहती है।</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link to="/astrology"><Button>ज्योतिष परामर्श लें</Button></Link><Link to="/pandits"><Button variant="secondary">पंडित बुक करें</Button></Link></div></div></div> : <div className="flex h-[65vh] flex-col"><div className="border-b border-brand-sand pb-4"><p className="eyebrow">सक्रिय बातचीत</p><h2 className="mt-1 text-2xl font-bold text-brand-ink">{counterpartLabel(selectedRoom)}</h2></div><div className="flex-1 space-y-3 overflow-y-auto py-5 pr-2">{messages.length ? messages.map((message) => <div key={message._id} className="rounded-2xl bg-brand-cream p-4"><p className="text-sm font-bold text-brand-clay">{message.sender?.name || "आप"}</p><p className="mt-2 text-sm leading-7 text-brand-ink">{message.content}</p></div>) : <p className="pt-12 text-center text-sm text-brand-ink/60">बातचीत शुरू करने के लिए संदेश भेजें।</p>}</div><div className="flex gap-3 border-t border-brand-sand pt-4"><input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); handleSend(); } }} className="flex-1 rounded-full border border-brand-sand px-4 py-3 outline-none focus:border-brand-clay" placeholder="अपना संदेश लिखें" disabled={sending} /><Button onClick={handleSend} disabled={!draft.trim() || sending}>{sending ? "भेजा जा रहा है..." : <><Send className="mr-2 h-4 w-4" />भेजें</>}</Button></div></div>}
        {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      </section>
    </div>
  );
}
