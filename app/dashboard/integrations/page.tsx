'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, Zap } from 'lucide-react';
import DashboardLayout from '../../../components/dashboard/dashboard-layout';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { api } from '../../../lib/api';

interface Integration {
    platform: string;
    status: string;
    connected_at: string | null;
}

const providers = [
    { key: 'stripe', label: 'Stripe', description: 'Payment processing and revenue data.', brandClass: 'text-slate-700' },
    { key: 'meta', label: 'Meta Ads', description: 'Ad spend and campaign performance.', brandClass: 'text-blue-700' },
    { key: 'shopify', label: 'Shopify', description: 'E-commerce orders and product metrics.', brandClass: 'text-green-700' },
    { key: 'google_ads', label: 'Google Ads', description: 'Google ad spend and conversion performance.', brandClass: 'text-amber-700' },
] as const;

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState<string | null>(null);

    useEffect(() => {
        api.get('/integrations')
            .then((res) => setIntegrations(res.data))
            .catch(() => {
                setIntegrations([]);
            });
    }, []);

    const handleConnect = async (platform: string) => {
        setLoading(platform);
        try {
            await api.post(`/integrations/connect/${platform}`, {});
            setIntegrations((prev) => [
                ...prev.filter((item) => item.platform !== platform),
                { platform, status: 'active', connected_at: new Date().toISOString() },
            ]);

            toast.success(`${platform.replace('_', ' ')} connected.`);
        } catch (err) {
            toast.error(`Failed to connect ${platform}. Check backend logs.`);
            console.error('Connection failed', err);
        } finally {
            setLoading(null);
        }
    };

    const handleConnectAll = async () => {
        setLoading('all');
        try {
            await api.post('/integrations/connect-all', {});
            setIntegrations(
                providers.map((provider) => ({
                    platform: provider.key,
                    status: 'active',
                    connected_at: new Date().toISOString(),
                })),
            );
            toast.success('All integrations connected.');
        } catch (err) {
            toast.error('Failed to connect. Check backend logs.');
            console.error(err);
        } finally {
            setLoading(null);
        }
    };

    const isConnected = (platform: string) =>
        integrations.some((item) => item.platform === platform && item.status === 'active');
    const allConnected = providers.every((provider) => isConnected(provider.key));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
                        <p className="text-gray-500">Connect your financial data sources.</p>
                    </div>
                    {!allConnected && (
                        <Button
                            onClick={handleConnectAll}
                            disabled={loading !== null}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                        >
                            {loading === 'all' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <Zap className="mr-2 h-4 w-4" />
                                    Connect All &amp; Load Demo Data
                                </>
                            )}
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {providers.map((provider) => (
                        <Card key={provider.key}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-xl">{provider.label}</CardTitle>
                                    {isConnected(provider.key) ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                            Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">Disconnected</Badge>
                                    )}
                                </div>
                                <CardDescription>{provider.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50 p-4">
                                    <span className={`text-2xl font-bold ${provider.brandClass}`}>{provider.label}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {isConnected(provider.key) ? (
                                    <Button
                                        variant="outline"
                                        className="w-full border-green-200 bg-green-50 text-green-700"
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Connected
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={() => handleConnect(provider.key)}
                                        disabled={loading !== null}
                                    >
                                        {loading === provider.key ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Connecting...
                                            </>
                                        ) : (
                                            `Connect ${provider.label}`
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {allConnected && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center text-green-800">
                        All integrations connected! Your dashboard and AI analyst now have data to work with.
                        Head to <a href="/dashboard" className="font-medium underline">Overview</a> or{' '}
                        <a href="/dashboard/chat" className="font-medium underline">AI Analyst</a> to explore.
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
