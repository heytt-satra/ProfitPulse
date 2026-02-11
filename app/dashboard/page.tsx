'use client';

import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock Data for MVP Visualization
const data = [
    { date: 'Jan 1', revenue: 4000, profit: 2400 },
    { date: 'Jan 2', revenue: 3000, profit: 1398 },
    { date: 'Jan 3', revenue: 2000, profit: 9800 },
    { date: 'Jan 4', revenue: 2780, profit: 3908 },
    { date: 'Jan 5', revenue: 1890, profit: 4800 },
    { date: 'Jan 6', revenue: 2390, profit: 3800 },
    { date: 'Jan 7', revenue: 3490, profit: 4300 },
];

export default function DashboardPage() {
    const { user } = useAuthStore();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                    <p className="text-gray-500">Here's what's happening with your business today.</p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <span className="text-xs text-green-500">+20.1%</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$45,231.89</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                            <span className="text-xs text-green-500">+15.2%</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$12,450.00</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Ad Spend</CardTitle>
                            <span className="text-xs text-red-500">+4.5%</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$8,234.00</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle>Revenue vs Profit (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#E84545" strokeWidth={2} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="profit" stroke="#008170" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
