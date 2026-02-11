import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';

interface User {
    id: string;
    email: string;
    full_name?: string;
    company_name?: string;
    subscription_tier?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            login: async (email, password) => {
                set({ isLoading: true });
                try {
                    const params = new URLSearchParams();
                    params.append('username', email);
                    params.append('password', password);

                    const response = await api.post('/auth/login', params, {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                    });

                    const { access_token } = response.data;
                    set({ token: access_token, isAuthenticated: true });

                    // Fetch user details? The login endpoint currently only returns token.
                    // We might need a /me endpoint or similar. For now, we set minimal state.
                    // Let's implement checkAuth to fetch user details if we had a /me endpoint.
                    // Since we don't have /me, we might have to rely on decoding the token or adding user to login response.
                    // For MVP, let's assume we can fetch user profile or decode token later.
                    // Wait, Auth endpoint `login_access_token` returns `Token` schema, which is just access_token.
                    // I should probably add a `/auth/me` endpoint in the backend for full profile.

                } catch (error) {
                    console.error('Login failed:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            signup: async (email, password, fullName) => {
                set({ isLoading: true });
                try {
                    const response = await api.post('/auth/signup', {
                        email, password, full_name: fullName
                    });
                    // Auto login after signup? Or require login.
                    // The endpoint returns the User object.
                } catch (error) {
                    console.error('Signup failed:', error);
                    throw error;
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
                localStorage.removeItem('token');
            },

            checkAuth: async () => {
                // Placeholder for when we have a /me endpoint
                // const token = get().token;
                // if (token) { ... }
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
