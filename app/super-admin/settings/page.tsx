"use client";

import { useState } from "react";
import { Save, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/providers/ToastContext";

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        platformName: "Music Platform",
        maxUploadSize: "50",
        allowGuestPlayback: true,
        maintenanceMode: false,
    });
    const { showToast } = useToast();

    const handleSave = async () => {
        setSaving(true);
        // Simulate save - in real app, this would call API
        setTimeout(() => {
            showToast("Settings saved successfully", "success");
            setSaving(false);
        }, 1000);
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h1 className="text-3xl font-bold mb-2">System Settings</h1>
                <p className="text-zinc-400">Configure global platform settings and preferences.</p>
            </div>

            {/* General Settings */}
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5 space-y-6">
                <h2 className="text-lg font-semibold">General Settings</h2>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-300">Platform Name</label>
                    <input
                        type="text"
                        value={settings.platformName}
                        onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-zinc-300">Max Upload Size (MB)</label>
                    <input
                        type="number"
                        value={settings.maxUploadSize}
                        onChange={(e) => setSettings({ ...settings, maxUploadSize: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00e5ff] outline-none"
                    />
                </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-zinc-900/50 rounded-xl p-6 border border-white/5 space-y-6">
                <h2 className="text-lg font-semibold">Feature Toggles</h2>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white">Allow Guest Playback</p>
                        <p className="text-sm text-zinc-400">Allow non-registered users to preview songs</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.allowGuestPlayback}
                            onChange={(e) => setSettings({ ...settings, allowGuestPlayback: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00e5ff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00e5ff]"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-white">Maintenance Mode</p>
                        <p className="text-sm text-zinc-400">Temporarily disable platform access</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#00e5ff] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                </div>
            </div>

            {/* Warning */}
            {settings.maintenanceMode && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="font-medium text-red-400">Maintenance Mode Active</p>
                        <p className="text-sm text-red-400/80 mt-1">The platform will be inaccessible to regular users when enabled.</p>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-[#00e5ff] hover:bg-[#00e5ff]/80 text-black px-6 py-3 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                    {saving ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Save Settings
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
