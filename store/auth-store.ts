import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

interface User {
    id: string;
    email: string;
    full_name?: string;
    company_name?: string;
    base_currency?: string;
    subscription_tier?: string;
    onboarding_completed?: boolean;
}

interface SessionWorkspace {
    workspace_id: string;
    role: string;
}

interface SessionResponse {
    authenticated: boolean;
    user: User;
    workspaces: SessionWorkspace[];
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    activeWorkspaceId: string | null;
    activeRole: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
    setActiveWorkspace: (workspaceId: string) => void;
}

const isBrowser = () => typeof window !== 'undefined';

const getStoredWorkspaceId = () => {
    if (!isBrowser()) {
        return null;
    }
    return localStorage.getItem('workspace_id');
};

const setStoredWorkspaceId = (workspaceId: string) => {
    if (!isBrowser()) {
        return;
    }
    localStorage.setItem('workspace_id', workspaceId);
};

const clearStoredWorkspaceId = () => {
    if (!isBrowser()) {
        return;
    }
    localStorage.removeItem('workspace_id');
};

const syncServerSessionCookie = async (accessToken: string) => {
    await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
    });
};

const clearServerSessionCookie = async () => {
    await fetch('/api/auth/session', {
        method: 'DELETE',
    });
};

const resolveActiveWorkspace = (workspaces: SessionWorkspace[], preferredWorkspaceId: string | null) => {
    if (!workspaces.length) {
        return { workspaceId: null, role: null };
    }

    const matched = preferredWorkspaceId
        ? workspaces.find((workspace) => workspace.workspace_id === preferredWorkspaceId)
        : null;

    const selected = matched ?? workspaces[0];
    return {
        workspaceId: selected.workspace_id,
        role: selected.role,
    };
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            activeWorkspaceId: null,
            activeRole: null,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({
                        email,
                        password,
                    });
                    if (error || !data.session?.access_token) {
                        throw error ?? new Error('Unable to authenticate with Supabase');
                    }

                    await syncServerSessionCookie(data.session.access_token);

                    const sessionRes = await api.get<SessionResponse>('/auth/session');
                    const preferredWorkspaceId = get().activeWorkspaceId ?? getStoredWorkspaceId();
                    const { workspaceId, role } = resolveActiveWorkspace(
                        sessionRes.data.workspaces,
                        preferredWorkspaceId,
                    );

                    if (workspaceId) {
                        setStoredWorkspaceId(workspaceId);
                    }

                    set({
                        user: sessionRes.data.user,
                        isAuthenticated: true,
                        isLoading: false,
                        activeWorkspaceId: workspaceId,
                        activeRole: role,
                    });
                } catch (error) {
                    clearStoredWorkspaceId();
                    await clearServerSessionCookie();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        activeWorkspaceId: null,
                        activeRole: null,
                    });
                    throw error;
                }
            },

            signup: async (email, password, fullName) => {
                set({ isLoading: true });
                try {
                    const { error } = await supabase.auth.signUp({
                        email,
                        password,
                        options: {
                            data: {
                                full_name: fullName,
                            },
                        },
                    });
                    if (error) {
                        throw error;
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                await supabase.auth.signOut();
                await clearServerSessionCookie();
                clearStoredWorkspaceId();
                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    activeWorkspaceId: null,
                    activeRole: null,
                });
            },

            checkAuth: async () => {
                set({ isLoading: true });
                try {
                    const { data } = await supabase.auth.getSession();
                    const accessToken = data.session?.access_token;
                    if (!accessToken) {
                        await clearServerSessionCookie();
                        clearStoredWorkspaceId();
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            activeWorkspaceId: null,
                            activeRole: null,
                        });
                        return;
                    }

                    await syncServerSessionCookie(accessToken);
                    const sessionRes = await api.get<SessionResponse>('/auth/session');

                    const preferredWorkspaceId = get().activeWorkspaceId ?? getStoredWorkspaceId();
                    const { workspaceId, role } = resolveActiveWorkspace(
                        sessionRes.data.workspaces,
                        preferredWorkspaceId,
                    );

                    if (workspaceId) {
                        setStoredWorkspaceId(workspaceId);
                    } else {
                        clearStoredWorkspaceId();
                    }

                    set({
                        user: sessionRes.data.user,
                        isAuthenticated: sessionRes.data.authenticated,
                        isLoading: false,
                        activeWorkspaceId: workspaceId,
                        activeRole: role,
                    });
                } catch {
                    await clearServerSessionCookie();
                    clearStoredWorkspaceId();
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        activeWorkspaceId: null,
                        activeRole: null,
                    });
                }
            },

            setActiveWorkspace: (workspaceId: string) => {
                setStoredWorkspaceId(workspaceId);
                set({ activeWorkspaceId: workspaceId });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                activeWorkspaceId: state.activeWorkspaceId,
                activeRole: state.activeRole,
            }),
        },
    ),
);
