import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card/Card";
import  Button  from "@/components/ui/button/Button";
import { Loader2, Send } from "lucide-react";

interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  sentAt: string;
}

export default function ChatDetail() {
  const { threadId } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/Chats/${threadId}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [threadId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await axios.post(`/Chats/${threadId}`, {
        message: newMessage,
      });
      setMessages([...messages, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Chat Detail</h1>
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <Card key={msg.id} className="bg-gray-100 dark:bg-gray-800">
              <CardContent className="p-4">
                <p className="font-semibold">{msg.sender}</p>
                <p>{msg.message}</p>
                <span className="text-xs text-gray-500">{new Date(msg.sentAt).toLocaleString()}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="text"
          className="flex-1 p-2 border rounded"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <Button onClick={sendMessage}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
