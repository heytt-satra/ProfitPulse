'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ── Metrics Hooks ──────────────────────────────────────────

interface TopExpense {
    category: string;
    amount: number;
}

interface MetricsSummary {
    date: string;
    net_profit: number;
    net_profit_change_pct: number | null;
    revenue_gross: number;
    revenue_net: number;
    total_expenses: number;
    top_expense: TopExpense | null;
    roas: number | null;
    transactions_count: number;
    insight: string | null;
}

interface DailyMetricRow {
    date: string;
    net_profit: number;
    revenue_gross: number;
    revenue_net: number;
    cost_ads_meta: number;
    cost_ads_google: number;
    cost_transaction_fees: number;
    cost_fixed_allocated: number;
    cost_variable: number;
}

interface DailyMetricsResponse {
    data: DailyMetricRow[];
    summary: {
        total_profit: number;
        avg_daily_profit: number;
        trend: 'up' | 'down' | 'flat';
    };
}

export function useMetricsSummary(date?: string) {
    return useQuery<MetricsSummary>({
        queryKey: ['metrics', 'summary', date],
        queryFn: async () => {
            const params = date ? { date } : {};
            const res = await api.get('/metrics/summary', { params });
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}

export function useDailyMetrics(startDate: string, endDate: string) {
    return useQuery<DailyMetricsResponse>({
        queryKey: ['metrics', 'daily', startDate, endDate],
        queryFn: async () => {
            const res = await api.get('/metrics/daily', {
                params: { start_date: startDate, end_date: endDate },
            });
            return res.data;
        },
        enabled: !!startDate && !!endDate,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
}

// ── Chat Hooks ──────────────────────────────────────────

interface ChatQueryResult {
    answer: string;
    sql: string;
    data_preview: Record<string, unknown>[] | null;
    chart_spec: Record<string, unknown> | null;
    confidence: number;
    provenance: string[];
    warnings: string[];
    error: string | null;
    execution_ms: number | null;
}

export function useChatQuery() {
    return useMutation<ChatQueryResult, Error, string>({
        mutationFn: async (question: string) => {
            const res = await api.post('/chat/query', { question });
            return res.data;
        },
    });
}

// ── Onboarding Hooks ──────────────────────────────────────

interface OnboardingStatus {
    completed: boolean;
    steps: {
        integrations_connected: boolean;
        currency_set: boolean;
        preferences_configured: boolean;
    };
}

export function useOnboardingStatus() {
    return useQuery<OnboardingStatus>({
        queryKey: ['onboarding', 'status'],
        queryFn: async () => {
            const res = await api.get('/onboarding/status');
            return res.data;
        },
    });
}

// ── User Profile Hooks ──────────────────────────────────────

interface UserProfile {
    id: string;
    email: string;
    full_name: string | null;
    company_name: string | null;
    base_currency: string;
    subscription_tier: string;
    onboarding_completed: boolean;
}

export function useUserProfile() {
    return useQuery<UserProfile>({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
            const res = await api.get('/user/profile');
            return res.data;
        },
    });
}

interface ApiHealth {
    status: string;
    project: string;
    environment: string;
    timestamp: string;
    version: string;
}

export function useApiHealth() {
    return useQuery<ApiHealth>({
        queryKey: ['system', 'health'],
        queryFn: async () => {
            const res = await api.get('/system/health');
            return res.data;
        },
        staleTime: 30 * 1000,
        refetchInterval: 60 * 1000,
        retry: 2,
    });
}
