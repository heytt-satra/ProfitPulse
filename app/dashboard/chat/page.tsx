'use client';

import DashboardLayout from '@/components/dashboard/dashboard-layout';
import ChatInterface from '@/components/dashboard/chat-interface';

export default function ChatPage() {
    return (
        <DashboardLayout>
            <div className="h-full flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">AI Financial Analyst</h1>
                    <p className="text-gray-500">Ask questions about your data in plain English.</p>
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <ChatInterface />
                </div>
            </div>
        </DashboardLayout>
    );
}
