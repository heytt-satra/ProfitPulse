'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { User, Bell, Save, CheckCircle } from 'lucide-react';

interface NotificationPrefs {
    email_enabled: boolean;
    slack_enabled: boolean;
    slack_webhook_url: string | null;
    delivery_time: string;
    timezone: string;
    include_insights: boolean;
}

export default function SettingsPage() {
    // Profile state
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    // Notification state
    const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>({
        email_enabled: true,
        slack_enabled: false,
        slack_webhook_url: null,
        delivery_time: '07:00',
        timezone: 'UTC',
        include_insights: true,
    });
    const [notifSaving, setNotifSaving] = useState(false);
    const [notifSaved, setNotifSaved] = useState(false);

    // Load current data
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [profileRes, notifRes] = await Promise.all([
                    api.get('/user/profile'),
                    api.get('/notifications/preferences'),
                ]);
                const p = profileRes.data;
                setFullName(p.full_name || '');
                setCompanyName(p.company_name || '');
                setBaseCurrency(p.base_currency || 'USD');

                setNotifPrefs(notifRes.data);
            } catch (err) {
                console.error('Failed to load settings:', err);
            }
        };
        loadSettings();
    }, []);

    const handleProfileSave = async () => {
        setProfileSaving(true);
        try {
            await api.put('/user/profile', {
                full_name: fullName,
                company_name: companyName,
                base_currency: baseCurrency,
            });
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save profile:', err);
        } finally {
            setProfileSaving(false);
        }
    };

    const handleNotifSave = async () => {
        setNotifSaving(true);
        try {
            await api.put('/notifications/preferences', notifPrefs);
            setNotifSaved(true);
            setTimeout(() => setNotifSaved(false), 2000);
        } catch (err) {
            console.error('Failed to save notification preferences:', err);
        } finally {
            setNotifSaving(false);
        }
    };

    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR', 'JPY'];
    const timezones = [
        'UTC', 'America/New_York', 'America/Chicago', 'America/Denver',
        'America/Los_Angeles', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo',
        'Asia/Kolkata', 'Australia/Sydney',
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-3xl">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage your profile and notification preferences.</p>
                </div>

                {/* Profile Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            <CardTitle>Profile</CardTitle>
                        </div>
                        <CardDescription>Your account and business details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Inc." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Base Currency</label>
                            <select
                                value={baseCurrency}
                                onChange={(e) => setBaseCurrency(e.target.value)}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <Button onClick={handleProfileSave} disabled={profileSaving}>
                            {profileSaved ? (
                                <><CheckCircle className="w-4 h-4 mr-2" /> Saved!</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Save Profile</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Notification Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-indigo-600" />
                            <CardTitle>Morning Pulse Notifications</CardTitle>
                        </div>
                        <CardDescription>Configure your daily financial briefing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                                <p className="text-xs text-gray-500">Receive your daily P&L summary via email</p>
                            </div>
                            <button
                                onClick={() => setNotifPrefs(p => ({ ...p, email_enabled: !p.email_enabled }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs.email_enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPrefs.email_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">Include AI Insights</p>
                                <p className="text-xs text-gray-500">Add AI-generated insights to your briefing</p>
                            </div>
                            <button
                                onClick={() => setNotifPrefs(p => ({ ...p, include_insights: !p.include_insights }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifPrefs.include_insights ? 'bg-indigo-600' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifPrefs.include_insights ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                                <Input
                                    type="time"
                                    value={notifPrefs.delivery_time}
                                    onChange={(e) => setNotifPrefs(p => ({ ...p, delivery_time: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                <select
                                    value={notifPrefs.timezone}
                                    onChange={(e) => setNotifPrefs(p => ({ ...p, timezone: e.target.value }))}
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                                </select>
                            </div>
                        </div>

                        <Button onClick={handleNotifSave} disabled={notifSaving}>
                            {notifSaved ? (
                                <><CheckCircle className="w-4 h-4 mr-2" /> Saved!</>
                            ) : (
                                <><Save className="w-4 h-4 mr-2" /> Save Notification Settings</>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
