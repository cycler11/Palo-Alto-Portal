"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { BlockingEntry } from "@/lib/types"
import EntriesTable from "@/components/entries-table"
import AddEntryModal from "@/components/add-entry-modal"
import AuditLog from "@/components/audit-log"
import { SettingsIcon } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  const [entries, setEntries] = useState<BlockingEntry[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showAudit, setShowAudit] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchEntries()
    const interval = setInterval(() => {
      fetchEntries()
      checkExpiredEntries()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchEntries = async () => {
    try {
      const res = await fetch("/api/entries")
      const data = await res.json()
      setEntries(data)
    } catch (error) {
      console.error("Failed to fetch entries:", error)
    }
  }

  const checkExpiredEntries = async () => {
    const now = Date.now()
    for (const entry of entries) {
      if (entry.status === "ACTIVE" && entry.expiresAt <= now) {
        try {
          await fetch(`/api/entries/${entry.id}`, { method: "DELETE" })
        } catch (error) {
          console.error("Failed to auto-expire entry:", error)
        }
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Palo Alto IP Blocker</h1>
            <p className="text-muted-foreground mt-1">Manage IP and domain blocking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAudit(!showAudit)}>
              Audit Log
            </Button>
            <Link href="/settings">
              <Button variant="outline" size="icon">
                <SettingsIcon className="w-4 h-4" />
              </Button>
            </Link>
            <Button onClick={() => setShowModal(true)}>Add Blocking Entry</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{entries.length}</div>
                  <div className="text-sm text-muted-foreground">Total Entries</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{entries.filter((e) => e.status === "ACTIVE").length}</div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{entries.filter((e) => e.status === "PENDING").length}</div>
                  <div className="text-sm text-muted-foreground">Pending</div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{entries.filter((e) => e.paloStatus === "ERROR").length}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {showAudit && <AuditLog />}

          <EntriesTable entries={entries} onRefresh={fetchEntries} />
        </div>
      </main>

      <AddEntryModal open={showModal} onOpenChange={setShowModal} onSuccess={fetchEntries} />
    </div>
  )
}
