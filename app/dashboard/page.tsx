'use client';

import { useMemo } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth-store';
import { useApiHealth, useDailyMetrics, useMetricsSummary } from '@/lib/hooks';
import { DashboardSkeleton } from '@/components/ui/loading-state';
import { ErrorBoundary } from '@/components/shared/error-boundary';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, DollarSign, Receipt, CreditCard, Sparkles, Wifi, WifiOff } from 'lucide-react';

// Fallback mock data
const mockData = [
    { date: 'Jan 1', revenue: 4000, profit: 2400 },
    { date: 'Jan 2', revenue: 3000, profit: 1398 },
    { date: 'Jan 3', revenue: 2000, profit: 9800 },
    { date: 'Jan 4', revenue: 2780, profit: 3908 },
    { date: 'Jan 5', revenue: 1890, profit: 4800 },
    { date: 'Jan 6', revenue: 2390, profit: 3800 },
    { date: 'Jan 7', revenue: 3490, profit: 4300 },
];

function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function TrendBadge({ value }: { value: number | null | undefined }) {
    if (value == null) return null;
    const isPositive = value > 0;
    const Icon = value > 0 ? TrendingUp : value < 0 ? TrendingDown : Minus;
    return (
        <span className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-600' : value < 0 ? 'text-red-500' : 'text-gray-400'}`}>
            <Icon className="w-3 h-3" />
            {Math.abs(value)}%
        </span>
    );
}

function DashboardContent() {
    const { user } = useAuthStore();

    // Calculate date range for last 7 days
    const { startDate, endDate } = useMemo(() => {
        const end = new Date();
        end.setDate(end.getDate() - 1);
        const start = new Date(end);
        start.setDate(start.getDate() - 6);
        return {
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        };
    }, []);

    const { data: summary, isLoading: summaryLoading, isError: summaryError } = useMetricsSummary();
    const { data: daily, isLoading: dailyLoading, isError: dailyError } = useDailyMetrics(startDate, endDate);
    const { data: apiHealth, isError: apiHealthError } = useApiHealth();

    // Show skeleton only while genuinely loading (not on error)
    if ((summaryLoading || dailyLoading) && !summaryError && !dailyError) {
        return <DashboardSkeleton />;
    }

    // Chart data: use API data if available, otherwise mock
    const chartData = daily?.data?.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: d.revenue_gross,
        profit: d.net_profit,
    })) || mockData;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
                </h1>
                <p className="text-gray-500">Here&apos;s what&apos;s happening with your business today.</p>
            </div>

            {(summaryError || dailyError) && (
                <Card className="border-amber-200 bg-amber-50/60">
                    <CardContent className="pt-6 text-sm text-amber-800">
                        Live metrics are temporarily unavailable. Showing fallback sample data until the API recovers.
                    </CardContent>
                </Card>
            )}

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                        <DollarSign className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary ? formatCurrency(summary.revenue_gross) : '$45,231.89'}
                        </div>
                        <TrendBadge value={summary?.net_profit_change_pct} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary ? formatCurrency(summary.net_profit) : '$12,450.00'}
                        </div>
                        <TrendBadge value={summary?.net_profit_change_pct} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
                        <Receipt className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary ? formatCurrency(summary.total_expenses) : '$8,234.00'}
                        </div>
                        {summary?.top_expense && (
                            <p className="text-xs text-gray-500 mt-1">
                                Top: {summary.top_expense.category} ({formatCurrency(summary.top_expense.amount)})
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">ROAS</CardTitle>
                        <CreditCard className="w-4 h-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {summary?.roas != null ? `${summary.roas}x` : 'N/A'}
                        </div>
                        <p className="text-xs text-gray-500">Return on Ad Spend</p>
                    </CardContent>
                </Card>
            </div>

            <Card className={apiHealthError ? 'border-red-200 bg-red-50/60' : 'border-green-200 bg-green-50/60'}>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            {apiHealthError ? (
                                <WifiOff className="h-4 w-4 text-red-600" />
                            ) : (
                                <Wifi className="h-4 w-4 text-green-600" />
                            )}
                            {apiHealthError ? 'Backend Unreachable' : 'Backend Healthy'}
                        </div>
                        {!apiHealthError && apiHealth?.timestamp && (
                            <span className="text-xs text-gray-500">
                                Last check: {new Date(apiHealth.timestamp).toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* AI Insight */}
            {summary?.insight && (
                <Card className="border-indigo-200 bg-indigo-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-indigo-900">AI Insight</p>
                                <p className="text-sm text-indigo-700 mt-1">{summary.insight}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue vs Profit (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number | string | undefined) => value != null ? formatCurrency(Number(value)) : ''}
                                    contentStyle={{ borderRadius: '8px', fontSize: '14px' }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#E84545" strokeWidth={2} activeDot={{ r: 8 }} name="Revenue" />
                                <Line type="monotone" dataKey="profit" stroke="#008170" strokeWidth={2} name="Profit" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <ErrorBoundary>
                <DashboardContent />
            </ErrorBoundary>
        </DashboardLayout>
    );
}
