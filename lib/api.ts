import axios, { type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const withApiV1Path = (value: string) => {
    const trimmed = trimTrailingSlash(value.trim());

    if (/\/api\/v1$/i.test(trimmed)) {
        return trimmed;
    }
    if (/\/api$/i.test(trimmed)) {
        return `${trimmed}/v1`;
    }

    try {
        const parsed = new URL(trimmed);
        const pathname = trimTrailingSlash(parsed.pathname);
        if (!pathname || pathname === '/') {
            parsed.pathname = '/api/v1';
            return trimTrailingSlash(parsed.toString());
        }
        return trimmed;
    } catch {
        if (!trimmed || trimmed === '/') {
            return '/api/v1';
        }
        return trimmed;
    }
};

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;
const API_URL = configuredApiUrl
    ? withApiV1Path(configuredApiUrl)
    : process.env.NODE_ENV === 'development'
      ? 'http://localhost:8000/api/v1'
      : typeof window !== 'undefined'
        ? `${window.location.origin}/api/v1`
        : 'http://localhost:8000/api/v1';
const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 300;
const RETRYABLE_METHODS = new Set(['get', 'head', 'options']);

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retryCount?: number;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getWorkspaceId = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem('workspace_id');
};

export const api = axios.create({
    baseURL: API_URL,
    timeout: 10_000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        if (isSupabaseConfigured) {
            try {
                const { data } = await supabase.auth.getSession();
                const token = data.session?.access_token ?? null;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch {
                // Skip auth header injection when Supabase is unavailable.
            }
        }

        const workspaceId = getWorkspaceId();
        if (workspaceId) {
            config.headers['X-Workspace-Id'] = workspaceId;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config as RetryableRequestConfig | undefined;
        const method = config?.method?.toLowerCase() ?? 'get';
        const status = error.response?.status;
        const shouldRetry =
            !!config &&
            RETRYABLE_METHODS.has(method) &&
            (status == null || status >= 500);

        if (shouldRetry) {
            const retryCount = config._retryCount ?? 0;
            if (retryCount < MAX_RETRIES) {
                config._retryCount = retryCount + 1;
                const delay = BASE_RETRY_DELAY_MS * 2 ** retryCount;
                await wait(delay);
                return api(config);
            }
        }

        const message = error.response?.data?.detail || error.message;

        if (error.code === 'ECONNABORTED') {
            toast.error('Request timed out. Please try again.');
        } else if (!status && (error.message === 'Network Error' || error.message === 'Failed to fetch')) {
            toast.error('Cannot reach API server. Verify NEXT_PUBLIC_API_URL and backend availability.');
        } else if (status === 404 && String(config?.url || '').includes('/auth/session')) {
            toast.error('Auth endpoint not found. Verify NEXT_PUBLIC_API_URL points to backend /api/v1.');
        } else if (status === 401) {
            toast.error('Your session has expired. Please sign in again.');
        } else if (status === 403) {
            toast.error('You do not have permission to perform this action.');
        } else if (status && status >= 500) {
            toast.error('Server error. Please try again later.');
        } else if (status === 400 || status === 422) {
            toast.error(message || 'Invalid request.');
        }

        return Promise.reject(error);
    },
);
