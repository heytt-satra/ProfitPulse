'use client';

import axios from 'axios';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import {
    CheckCircle,
    ArrowRight,
    ArrowLeft,
    Plug,
    DollarSign,
    Bell,
    Sparkles,
    CreditCard,
    Store,
    Facebook,
    Search,
    Loader2,
} from 'lucide-react';

const STEPS = ['Connect Integrations', 'Set Currency', 'Preferences'];

const platforms = [
    { id: 'stripe', name: 'Stripe', description: 'Payment processing and revenue data', icon: CreditCard },
    { id: 'shopify', name: 'Shopify', description: 'E-commerce orders and sales', icon: Store },
    { id: 'meta', name: 'Meta Ads', description: 'Facebook and Instagram ad spend', icon: Facebook },
    { id: 'google_ads', name: 'Google Ads', description: 'Google ad spend and ROAS', icon: Search },
] as const;

function OnboardingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
    const [oauthFeedback, setOauthFeedback] = useState<string | null>(null);
    const [shopifyDomain, setShopifyDomain] = useState('');
    const [shopifyDomainDraft, setShopifyDomainDraft] = useState('');
    const [isShopifyModalOpen, setIsShopifyModalOpen] = useState(false);

    // Step 1: Integrations
    const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([]);

    // Step 2: Currency
    const [currency, setCurrency] = useState('USD');

    // Step 3: Preferences
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [deliveryTime, setDeliveryTime] = useState('07:00');

    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'];

    useEffect(() => {
        const provider = searchParams.get('oauth_provider');
        const status = searchParams.get('oauth_status');
        const error = searchParams.get('oauth_error');

        if (!provider || !status) {
            return;
        }

        if (status === 'active') {
            setConnectedPlatforms((prev) => (prev.includes(provider) ? prev : [...prev, provider]));
            setOauthFeedback(`${provider} connected successfully.`);
        } else {
            setOauthFeedback(`Could not connect ${provider}. ${error ? `Reason: ${error}.` : ''}`);
        }

        router.replace('/dashboard/onboarding');
    }, [router, searchParams]);

    useEffect(() => {
        let cancelled = false;

        const loadIntegrations = async () => {
            try {
                const response = await api.get('/integrations');
                if (cancelled) {
                    return;
                }
                const active = (response.data as Array<{ platform?: string; status?: string }>)
                    .filter((item) => item.platform && item.status === 'active')
                    .map((item) => item.platform as string);
                setConnectedPlatforms(Array.from(new Set(active)));
            } catch {
                // Non-blocking for onboarding UI.
            }
        };

        void loadIntegrations();
        return () => {
            cancelled = true;
        };
    }, []);

    const normalizeShopifyDomain = (value: string): string | null => {
        const trimmed = value.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
        if (!trimmed || !trimmed.endsWith('.myshopify.com')) {
            return null;
        }
        return trimmed;
    };

    const startOAuthConnect = async (platformId: string, providedShopDomain?: string) => {
        if (connectingPlatform) {
            return;
        }
        setConnectingPlatform(platformId);
        setOauthFeedback(null);

        try {
            const redirectUri = `${window.location.origin}/dashboard/onboarding`;

            const response = await api.post(`/integrations/${platformId}/oauth/start`, {
                redirect_uri: redirectUri,
                shop_domain: platformId === 'shopify' ? providedShopDomain : undefined,
            });

            const authUrl = response.data?.auth_url;
            if (!authUrl || typeof authUrl !== 'string') {
                throw new Error('OAuth start response did not include auth_url');
            }

            window.location.assign(authUrl);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 503) {
                // Local-dev fallback when OAuth credentials are not configured yet.
                try {
                    await api.post(`/integrations/connect/${platformId}`);
                    setConnectedPlatforms((prev) => (prev.includes(platformId) ? prev : [...prev, platformId]));
                    setOauthFeedback(`${platformId} connected in local fallback mode.`);
                } catch {
                    setOauthFeedback(`Failed to connect ${platformId}.`);
                }
            } else {
                setOauthFeedback(`Failed to connect ${platformId}.`);
            }
        } finally {
            setConnectingPlatform(null);
        }
    };

    const handleConnect = async (platformId: string) => {
        if (platformId === 'shopify') {
            setOauthFeedback(null);
            setShopifyDomainDraft(shopifyDomain);
            setIsShopifyModalOpen(true);
            return;
        }
        await startOAuthConnect(platformId);
    };

    const handleShopifyDomainSubmit = async () => {
        const normalized = normalizeShopifyDomain(shopifyDomainDraft);
        if (!normalized) {
            setOauthFeedback('Please enter a valid Shopify domain (example.myshopify.com).');
            return;
        }
        setShopifyDomain(normalized);
        setIsShopifyModalOpen(false);
        await startOAuthConnect('shopify', normalized);
    };

    const handleComplete = async () => {
        setLoading(true);
        try {
            await api.put('/user/profile', { base_currency: currency });
            await api.put('/notifications/preferences', {
                email_enabled: emailEnabled,
                delivery_time: deliveryTime,
            });
            await api.post('/onboarding/complete');
            router.push('/dashboard');
        } catch (err) {
            console.error('Onboarding completion failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                        Welcome to ProfitPulse
                    </h1>
                    <p className="text-gray-500 mt-2">Let&apos;s set up your financial intelligence in 3 easy steps.</p>
                    {oauthFeedback && <p className="mt-3 text-sm text-gray-600">{oauthFeedback}</p>}
                </div>

                <div className="flex items-center justify-center mb-8 gap-2">
                    {STEPS.map((label, i) => (
                        <div key={label} className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                    i < step
                                        ? 'bg-green-500 text-white'
                                        : i === step
                                          ? 'bg-indigo-600 text-white'
                                          : 'bg-gray-200 text-gray-500'
                                }`}
                            >
                                {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                            </div>
                            <span
                                className={`text-sm hidden sm:inline ${
                                    i === step ? 'font-semibold text-gray-900' : 'text-gray-400'
                                }`}
                            >
                                {label}
                            </span>
                            {i < STEPS.length - 1 && <div className="w-12 h-0.5 bg-gray-200 mx-1" />}
                        </div>
                    ))}
                </div>

                <Card>
                    {step === 0 && (
                        <>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Plug className="w-5 h-5 text-indigo-600" />
                                    <CardTitle>Connect Your Platforms</CardTitle>
                                </div>
                                <CardDescription>Connect at least one platform to get started. You can add more later.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {platforms.map((platform) => {
                                    const Icon = platform.icon;
                                    const isConnected = connectedPlatforms.includes(platform.id);
                                    return (
                                        <div
                                            key={platform.id}
                                            className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                                                isConnected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5 text-gray-700" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{platform.name}</p>
                                                    <p className="text-xs text-gray-500">{platform.description}</p>
                                                </div>
                                            </div>
                                            {isConnected ? (
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            ) : (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => void handleConnect(platform.id)}
                                                    disabled={connectingPlatform === platform.id}
                                                >
                                                    {connectingPlatform === platform.id ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Redirecting...
                                                        </>
                                                    ) : (
                                                        'Connect'
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    );
                                })}
                            </CardContent>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-indigo-600" />
                                    <CardTitle>Set Your Base Currency</CardTitle>
                                </div>
                                <CardDescription>All financial data will be converted and displayed in this currency.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-3">
                                    {currencies.map((c) => (
                                        <button
                                            key={c}
                                            className={`p-4 rounded-lg border-2 text-center font-semibold transition-colors ${
                                                currency === c
                                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                                    : 'border-gray-200 hover:border-indigo-300 text-gray-700'
                                            }`}
                                            onClick={() => setCurrency(c)}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-indigo-600" />
                                    <CardTitle>Morning Pulse Setup</CardTitle>
                                </div>
                                <CardDescription>Get a daily financial briefing delivered to your inbox.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Email Notifications</p>
                                        <p className="text-sm text-gray-500">Receive daily P&amp;L summary</p>
                                    </div>
                                    <button
                                        onClick={() => setEmailEnabled(!emailEnabled)}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                            emailEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                emailEnabled ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                                    <Input type="time" value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} />
                                    <p className="text-xs text-gray-500 mt-1">
                                        We&apos;ll send your briefing at this time each morning.
                                    </p>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>

                <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>

                    {step < STEPS.length - 1 ? (
                        <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && connectedPlatforms.length === 0}>
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleComplete} disabled={loading}>
                            {loading ? (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2 animate-spin" /> Setting up...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" /> Complete Setup
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {isShopifyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-gray-900">Connect Shopify</h2>
                        <p className="mt-1 text-sm text-gray-600">Enter your store domain to start Shopify OAuth.</p>
                        <div className="mt-4">
                            <label className="mb-1 block text-xs font-medium text-gray-600">Shopify Domain</label>
                            <Input
                                value={shopifyDomainDraft}
                                onChange={(e) => setShopifyDomainDraft(e.target.value)}
                                placeholder="your-store.myshopify.com"
                                autoFocus
                            />
                        </div>
                        <div className="mt-5 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsShopifyModalOpen(false)}
                                disabled={connectingPlatform === 'shopify'}
                            >
                                Cancel
                            </Button>
                            <Button onClick={() => void handleShopifyDomainSubmit()} disabled={connectingPlatform === 'shopify'}>
                                {connectingPlatform === 'shopify' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Redirecting...
                                    </>
                                ) : (
                                    'Continue'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
            <OnboardingPageContent />
        </Suspense>
    );
}
