"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { toast } from "react-toastify";
import { Loader2, Save } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    banner: {
      text: "",
      linkUrl: "",
      linkText: "",
      isVisible: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings updated successfully");
      } else {
        throw new Error("Failed to update settings");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Promotional Banner Settings */}
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Promotional Banner</h2>
              <p className="text-sm text-muted-foreground">
                Manage the top banner content and visibility
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="banner-visible">Visible</Label>
              <Switch
                id="banner-visible"
                checked={settings.banner.isVisible}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    banner: { ...settings.banner, isVisible: checked },
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="banner-text">Banner Text</Label>
              <Input
                id="banner-text"
                value={settings.banner.text}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    banner: { ...settings.banner, text: e.target.value },
                  })
                }
                placeholder="e.g., Sign up and get 20% off to your first order."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="link-text">Link Text</Label>
                <Input
                  id="link-text"
                  value={settings.banner.linkText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      banner: { ...settings.banner, linkText: e.target.value },
                    })
                  }
                  placeholder="e.g., Sign Up Now"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link-url">Link URL</Label>
                <Input
                  id="link-url"
                  value={settings.banner.linkUrl}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      banner: { ...settings.banner, linkUrl: e.target.value },
                    })
                  }
                  placeholder="e.g., /products"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
