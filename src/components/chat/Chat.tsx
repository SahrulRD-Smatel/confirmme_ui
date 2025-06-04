import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Input from "@/components/form/input/InputField";
import { Paperclip, Send } from "lucide-react";
import { motion } from "framer-motion";
import Button from "@/components/ui/button/Button";

interface Message {
  id: number;
  text?: string;
  fileUrl?: string;
  sender: "user" | "bot";
}

interface ChatMessage {
  id: number;
  message?: string;
  fileUrl?: string;
  senderId: number;
}

export default function ChatComponent() {
  const { threadId } = useParams<{ threadId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [receiverId, setReceiverId] = useState<number | null>(null);
  const userId = Number(localStorage.getItem("userId")); // Ambil userId dari localStorage

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threadId) return;

    const fetchReceiver = async () => {
      try {
        const response = await fetch(`https://localhost:7035/api/chats/thread/${threadId}/receiver`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Gagal mengambil penerima");

        const data: { receiverId: number } = await response.json();
        setReceiverId(data.receiverId);
      } catch (error) {
        console.error("Error fetching receiver:", error);
      }
    };

    fetchReceiver();
  }, [threadId]);

  useEffect(() => {
    if (!threadId) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://localhost:7035/api/chats/thread/${threadId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        if (!response.ok) throw new Error("Gagal mengambil pesan");

        const data: ChatMessage[] = await response.json();
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            text: msg.message,
            fileUrl: msg.fileUrl,
            sender: msg.senderId === userId ? "user" : "bot",
          }))
        );
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [threadId, userId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !file) || !threadId || !receiverId) return;

    const formData = new FormData();
    formData.append("threadId", threadId);
    formData.append("receiverId", receiverId.toString());
    if (input) formData.append("message", input);
    if (file) formData.append("file", file);

    const newMessage: Message = {
      id: Date.now(),
      text: input || undefined,
      fileUrl: file ? URL.createObjectURL(file) : undefined,
      sender: "user",
    };

    setMessages([...messages, newMessage]);
    setInput("");
    setFile(null);

    try {
      const response = await fetch("https://localhost:7035/api/chats", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal mengirim pesan");

      const data: ChatMessage = await response.json();
      setMessages((prev) => [
        ...prev,
        { id: data.id, text: data.message, fileUrl: data.fileUrl, sender: "user" },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto p-4 border rounded-lg shadow-lg bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto max-h-80 p-2 space-y-2">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`p-3 rounded-lg w-fit max-w-xs ${
              msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-gray-800"
            }`}
          >
            {msg.text && <p>{msg.text}</p>}
            {msg.fileUrl && (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">
                Lihat file
              </a>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center gap-2 border-t p-2">
        <label className="p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
          <Paperclip size={20} />
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button size="sm" variant="primary" onClick={sendMessage} startIcon={<Send size={18} />}>
          Kirim
        </Button>
      </div>
    </div>
  );
}
