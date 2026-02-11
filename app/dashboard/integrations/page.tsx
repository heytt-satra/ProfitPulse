'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface Integration {
    platform: string;
    status: string;
    connected_at: string;
}

export default function IntegrationsPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(false);

    // Mock fetch or real fetch
    useEffect(() => {
        // api.get('/integrations').then(res => setIntegrations(res.data)).catch(console.error);
        // For MVP visual, let's use state to simulate
    }, []);

    const handleConnect = async (platform: string) => {
        setLoading(true);
        try {
            // Simulate OAuth flow
            await api.post(`/integrations/connect/${platform}`, { code: "mock_code_123" });
            // In a real app, this would be a redirect to Stripe/Meta OAuth URL

            setIntegrations(prev => [
                ...prev.filter(i => i.platform !== platform),
                { platform, status: 'active', connected_at: new Date().toISOString() }
            ]);
        } catch (err) {
            console.error("Connection failed", err);
        } finally {
            setLoading(false);
        }
    };

    const isConnected = (platform: string) => integrations.some(i => i.platform === platform && i.status === 'active');

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
                    <p className="text-gray-500">Connect your financial data sources.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Stripe Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">Stripe</CardTitle>
                                {isConnected('stripe') ?
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge> :
                                    <Badge variant="outline">Disconnected</Badge>
                                }
                            </div>
                            <CardDescription>Payment processing and revenue data.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-center h-24">
                                <span className="text-2xl font-bold text-slate-700">Stripe</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {isConnected('stripe') ? (
                                <Button variant="outline" className="w-full text-green-700 border-green-200 bg-green-50">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Connected
                                </Button>
                            ) : (
                                <Button className="w-full" onClick={() => handleConnect('stripe')} disabled={loading}>
                                    Connect Stripe
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Meta Ads Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">Meta Ads</CardTitle>
                                {isConnected('meta') ?
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Active</Badge> :
                                    <Badge variant="outline">Disconnected</Badge>
                                }
                            </div>
                            <CardDescription>Ad spend and campaign performance (Facebook/Instagram).</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-center h-24">
                                <span className="text-2xl font-bold text-blue-700">Meta</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            {isConnected('meta') ? (
                                <Button variant="outline" className="w-full text-green-700 border-green-200 bg-green-50">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Connected
                                </Button>
                            ) : (
                                <Button className="w-full" variant="secondary" onClick={() => handleConnect('meta')} disabled={loading}>
                                    Connect Meta
                                </Button>
                            )}
                        </CardFooter>
                    </Card>

                    {/* Shopify Card (Coming Soon) */}
                    <Card className="opacity-70 border-dashed">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">Shopify</CardTitle>
                                <Badge variant="secondary">Coming Soon</Badge>
                            </div>
                            <CardDescription>E-commerce orders and inventory.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-center h-24">
                                <span className="text-2xl font-bold text-green-600">Shopify</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button disabled className="w-full">Waitlist</Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
