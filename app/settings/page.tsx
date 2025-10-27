"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { Settings as SettingsType } from "@/lib/types"
import Link from "next/link"
import { ArrowLeft, Copy, Check } from "lucide-react"

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      setSettings(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to load settings", variant: "destructive" })
    }
  }

  const handleSave = async () => {
    if (!settings) return
    setLoading(true)
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) throw new Error("Failed to save")
      toast({ title: "Success", description: "Settings saved" })
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const edlUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/ip.txt${settings?.edlToken ? `?token=${settings.edlToken}` : ""}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(edlUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!settings) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure integration and security</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Integration Mode</CardTitle>
            <CardDescription>Choose how to sync with Palo Alto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Mode</label>
              <Select
                value={settings.integrationMode}
                onValueChange={(value: any) => setSettings({ ...settings, integrationMode: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="edl">EDL (External Dynamic List)</SelectItem>
                  <SelectItem value="address-objects">Address Objects + Group</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {settings.integrationMode === "edl"
                  ? "Palo Alto reads from /api/ip.txt endpoint"
                  : "Creates address objects and adds to group in Palo Alto"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>EDL Endpoint</CardTitle>
            <CardDescription>Public URL for Palo Alto to fetch blocked IPs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg font-mono text-xs break-all">{edlUrl}</div>
            <Button onClick={copyToClipboard} variant="outline" className="w-full bg-transparent">
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Configure authentication and testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium">DRY-RUN Mode</label>
                <p className="text-xs text-muted-foreground mt-1">Log changes without syncing to Palo Alto</p>
              </div>
              <Switch
                checked={settings.dryRun}
                onCheckedChange={(checked) => setSettings({ ...settings, dryRun: checked })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">EDL Token (Optional)</label>
              <Input
                type="password"
                placeholder="Leave empty for public access"
                value={settings.edlToken || ""}
                onChange={(e) => setSettings({ ...settings, edlToken: e.target.value })}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-2">If set, Palo Alto must include ?token=... in the URL</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Palo Alto API (Optional)</CardTitle>
            <CardDescription>For Address Objects + Group mode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">API URL</label>
              <Input
                placeholder="https://palo-alto.example.com/api/v1"
                value={settings.paloAltoApiUrl || ""}
                onChange={(e) => setSettings({ ...settings, paloAltoApiUrl: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">API Key</label>
              <Input
                type="password"
                placeholder="Your Palo Alto API key"
                value={settings.paloAltoApiKey || ""}
                onChange={(e) => setSettings({ ...settings, paloAltoApiKey: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Address Group Name</label>
              <Input
                placeholder="blocked-ips"
                value={settings.addressGroupName || ""}
                onChange={(e) => setSettings({ ...settings, addressGroupName: e.target.value })}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              Cancel
            </Button>
          </Link>
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </main>
    </div>
  )
}
