'use client';

import { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Code, Database, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils exists, or I might need to create it

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sql?: string;
    data?: any[];
    error?: string;
}

export default function ChatInterface() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am your AI Financial Analyst. Ask me anything about your revenue, expenses, or profit trends.' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await api.post('/chat/query', { question: userMessage.content });
            const { sql, data, explanation, error } = response.data;

            const assistantMessage: Message = {
                role: 'assistant',
                content: error ? `I encountered an error: ${error}` : (explanation || 'Here is what I found:'),
                sql: sql,
                data: data,
                error: error
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I failed to process your request. Please try again.',
                error: 'Network or Server Error'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={cn("flex gap-4", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0 mt-1">
                                    <Bot size={16} />
                                </div>
                            )}

                            <div className={cn(
                                "rounded-lg p-4 max-w-[85%]",
                                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 shadow-sm"
                            )}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>

                                {msg.sql && (
                                    <div className="mt-4 bg-slate-900 rounded-md p-3 overflow-x-auto">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                                            <Code size={12} /> Generated SQL
                                        </div>
                                        <code className="text-xs text-green-400 font-mono block whitespace-pre">
                                            {msg.sql}
                                        </code>
                                    </div>
                                )}

                                {msg.data && msg.data.length > 0 && (
                                    <div className="mt-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                            <Database size={12} /> result_set ({msg.data.length} rows)
                                        </div>
                                        <div className="overflow-x-auto border border-gray-200 rounded-md">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-gray-50 text-gray-600 font-medium">
                                                    <tr>
                                                        {Object.keys(msg.data[0]).map(key => (
                                                            <th key={key} className="px-3 py-2 border-b">{key}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {msg.data.slice(0, 5).map((row, i) => (
                                                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                                            {Object.values(row).map((val: any, j) => (
                                                                <td key={j} className="px-3 py-2 text-gray-700">
                                                                    {typeof val === 'object' ? JSON.stringify(val) : val}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {msg.data.length > 5 && (
                                                <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 text-center">
                                                    {msg.data.length - 5} more rows...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                                <Bot size={16} />
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                                <span className="text-sm text-gray-500">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask e.g. 'What was the profit margin last week?'"
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        <Send size={18} className="mr-2" />
                        Ask AI
                    </Button>
                </form>
            </div>
        </div>
    );
}
