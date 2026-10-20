"use client";

import { useEffect, useState } from "react";
import { Save, Upload, Package } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSettings, updateSettings, uploadPlugin } from "@/services/admin";
import { getAuthToken } from "@/lib/auth-cookie";
import type { Setting } from "@/lib/types";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const token = await getAuthToken();
        if (!token) return;
        const data = await getSettings(token);
        const map: Record<string, string> = {};
        data.forEach((s: Setting) => { map[s.key] = s.value; });
        setSettings(map);
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      await updateSettings(token, settings);
      toast.success("Settings saved");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".zip")) {
      toast.error("Please upload a .zip file");
      return;
    }
    setUploading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      const result = await uploadPlugin(token, file);
      toast.success(`Plugin uploaded (v${result.version})`);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function updateField(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Settings"
          description="Configure pricing, plugin, and system settings."
          breadcrumbs={[{ label: "Settings" }]}
        />
        <div className="h-64 rounded-[var(--radius-lg)] animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <PageHeader
        title="Settings"
        description="Configure pricing, plugin, and system settings."
        breadcrumbs={[{ label: "Settings" }]}
      />

      {/* Pricing Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Pricing</h2>
          <p className="text-sm text-[var(--color-text-muted)] font-body">
            Configure plugin pricing and trial settings.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Price per seat/year (USD)"
              type="number"
              value={settings.price_per_seat_year ?? ""}
              onChange={(e) => updateField("price_per_seat_year", e.target.value)}
            />
            <Input
              label="Team price (USD)"
              type="number"
              value={settings.team_price ?? ""}
              onChange={(e) => updateField("team_price", e.target.value)}
            />
            <Input
              label="Team threshold (seats)"
              type="number"
              value={settings.team_threshold ?? ""}
              onChange={(e) => updateField("team_threshold", e.target.value)}
            />
            <Input
              label="Trial days"
              type="number"
              value={settings.trial_days ?? ""}
              onChange={(e) => updateField("trial_days", e.target.value)}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={saving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plugin Upload */}
      <Card>
        <CardHeader>
          <h2 className="text-h6 font-heading text-[var(--color-text-primary)]">Plugin File</h2>
          <p className="text-sm text-[var(--color-text-muted)] font-body">
            Upload a new version of the Motion AI plugin (.zip).
          </p>
        </CardHeader>
        <CardContent>
          {settings.plugin_version && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--color-bg-elevated)] rounded-[var(--radius-md)]">
              <Package className="h-4 w-4 text-[var(--color-primary-600)]" />
              <div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] font-body">
                  Current version: {settings.plugin_version}
                </p>
                {settings.plugin_uploaded_at && (
                  <p className="text-xs text-[var(--color-text-muted)] font-body">
                    Uploaded: {settings.plugin_uploaded_at}
                  </p>
                )}
              </div>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="file"
              accept=".zip"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button
              variant="secondary"
              size="md"
              loading={uploading}
              leftIcon={<Upload className="h-4 w-4" />}
              onClick={() => {}}
              className="pointer-events-none"
            >
              {uploading ? "Uploading..." : "Upload Plugin .zip"}
            </Button>
          </label>
        </CardContent>
      </Card>
    </div>
  );
}
