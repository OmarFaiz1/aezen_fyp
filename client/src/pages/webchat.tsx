import { useState, useEffect, useRef } from "react";
import { useRoute } from "wouter";
import { getGuestSocket } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot } from "lucide-react";
import { motion } from "framer-motion";

import { BASE_URL } from "@/lib/api";

async function guestApiRequest(method: string, url: string, token: string | null, data?: any) {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const path = url.startsWith("/api") ? url : `/api${url}`;
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    });
    if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
    }
    return res.json();
}

export default function WebChat() {
    const [match, params] = useRoute("/webchat/:tenantId");
    const tenantId = params?.tenantId;

    // State
    const [token, setToken] = useState<string | null>(() => localStorage.getItem(`webchat_token_${tenantId}`));
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const [isConnected, setIsConnected] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    const [tenantName, setTenantName] = useState("");

    // Initial Load & Socket Connection
    useEffect(() => {
        if (!tenantId) return;

        // Fetch Tenant Config
        guestApiRequest("GET", `/api/webchat/config/${tenantId}`, null)
            .then(data => setTenantName(data.name))
            .catch(console.error);

        if (!token) return;

        // Load history
        guestApiRequest("GET", "/api/webchat/messages", token)
            .then(setMessages)
            .catch(console.error);

        // Connect Socket
        const socket = getGuestSocket(token);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        const onChatResponse = (data: any) => {
            // AI Response (or just generic response)
            // We might receive the full message object or just content
            // Backend emits { message: string } for AI response
            // But we also listen to 'message:new' for agent/user messages?
            // Let's handle both.
        };

        const onMessageNew = (msg: any) => {
            setMessages(prev => [...prev, msg]);
            scrollToBottom();
        };

        // Backend currently emits 'chat_response' for AI reply (string)
        // And 'message:new' for Agent reply (object)
        // And 'message:new' for User message (object) - via WebChatService

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("message:new", onMessageNew);

        // Handle AI response which is currently just a string in 'chat_response'
        // We should ideally standardize this in backend, but for now:
        socket.on("chat_response", (data: { message: string }) => {
            // Create a temporary message object for AI response if not received via message:new
            // But wait, ChatService.processMessage saves the AI message to DB.
            // Does it emit 'message:new'?
            // WebChatService emits 'message:new' for USER message.
            // ChatService.processMessage does NOT emit 'message:new' for AI message.
            // So we rely on 'chat_response'.

            const aiMsg = {
                id: Date.now().toString(), // temp id
                content: data.message,
                sender: 'ai',
                createdAt: new Date().toISOString(),
            };
            setMessages(prev => [...prev, aiMsg]);
            scrollToBottom();
        });

        if (socket.connected) onConnect();

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("message:new", onMessageNew);
            socket.off("chat_response");
        };
    }, [tenantId, token]);

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }, 100);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenantId || !name || !email) return;

        try {
            const res = await guestApiRequest("POST", "/api/webchat/identify", null, { tenantId, name, email });
            const newToken = res.accessToken;
            localStorage.setItem(`webchat_token_${tenantId}`, newToken);
            setToken(newToken);
        } catch (err) {
            console.error("Login failed", err);
            alert("Failed to start chat. Please try again.");
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !token) return;

        const content = input;
        setInput("");

        // Optimistic update
        const tempMsg = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMsg]);
        scrollToBottom();

        try {
            await guestApiRequest("POST", "/api/webchat/send", token, { content });
        } catch (err) {
            console.error("Send failed", err);
            // Remove optimistic message or show error
        }
    };

    if (!tenantId) return <div className="p-8 text-center">Invalid Tenant URL</div>;

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Chat with {tenantName || 'Support'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <Input value={name} onChange={e => setName(e.target.value)} required placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
                            </div>
                            <Button type="submit" className="w-full">Start Chat</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="bg-white border-b p-4 flex items-center justify-between sticky top-0 z-10">
                <h1 className="font-bold text-lg">Support Chat for {tenantName}</h1>
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? "Connected" : "Disconnected"} />
            </header>

            <div className="flex-1 overflow-hidden relative max-w-3xl mx-auto w-full bg-white shadow-sm my-4 rounded-lg flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.map((msg, i) => {
                        const isMe = msg.sender === 'user';
                        return (
                            <motion.div
                                key={msg.id || i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[80%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <span className="text-[10px] opacity-70 block text-right mt-1">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="p-4 border-t bg-white">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!isConnected && false}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
