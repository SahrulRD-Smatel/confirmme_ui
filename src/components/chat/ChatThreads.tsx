import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card/Card";
import  Button  from "@/components/ui/button/Button";
import { Loader2, MessageCircle } from "lucide-react";

interface ChatThread {
  id: number;
  title: string;
  createdAt: string;
}

export default function ChatThreads() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const response = await axios.get("/ChatThreads");
        setThreads(response.data);
      } catch (error) {
        console.error("Error fetching chat threads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Chat Threads</h1>
      {loading ? (
        <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {threads.length > 0 ? (
            threads.map((thread) => (
              <Card
                key={thread.id}
                className="cursor-pointer hover:shadow-lg transition">
                    <div onClick={() => navigate(`/chat/${thread.id}`)} className="p-4 flex items-center gap-3">
                    <CardContent className="p-4 flex items-center gap-3">
                    <MessageCircle className="text-gray-600" />
                        <div>
                            <h2 className="text-lg font-semibold">{thread.title}</h2>
                            <p className="text-sm text-gray-500">
                                {new Date(thread.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </CardContent>
                    </div>
              </Card>
            ))
          ) : (
            <p className="text-gray-500">No chat threads available.</p>
          )}
        </div>
      )}
      <div className="mt-6">
        <Button onClick={() => navigate("/chat/new")}>Start New Chat</Button>
      </div>
    </div>
  );
}
