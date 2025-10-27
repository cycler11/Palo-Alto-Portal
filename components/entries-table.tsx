"use client"

import { useState } from "react"
import type { BlockingEntry } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Trash2, RotateCcw, Clock } from "lucide-react"
import StatusBadge from "./status-badge"

interface EntriesTableProps {
  entries: BlockingEntry[]
  onRefresh: () => void
}

export default function EntriesTable({ entries, onRefresh }: EntriesTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all") // Updated default value to 'all'
  const [loading, setLoading] = useState<string | null>(null)
  const { toast } = useToast()

  const filtered = entries.filter((entry) => {
    const matchesSearch =
      entry.input.toLowerCase().includes(search.toLowerCase()) ||
      entry.comment.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || entry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    setLoading(id)
    try {
      const res = await fetch(`/api/entries/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      toast({ title: "Success", description: "Entry removed" })
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  const handleResync = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resync" }),
      })
      if (!res.ok) throw new Error("Failed to resync")
      toast({ title: "Success", description: "Entry resynced" })
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  const handleExtend = async (id: string, months: number) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/entries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "extend", months }),
      })
      if (!res.ok) throw new Error("Failed to extend")
      toast({ title: "Success", description: `Extended by ${months} month(s)` })
      onRefresh()
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by IP, domain, or comment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem> {/* Updated value prop */}
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="REMOVED">Removed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Input</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">IPs</th>
              <th className="px-4 py-3 text-left font-medium">Comment</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Palo Status</th>
              <th className="px-4 py-3 text-left font-medium">Expires</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b border-border hover:bg-muted/50">
                <td className="px-4 py-3 font-mono text-xs">{entry.input}</td>
                <td className="px-4 py-3 text-xs">{entry.kind.toUpperCase()}</td>
                <td className="px-4 py-3 text-xs">
                  <div className="space-y-1">
                    {entry.resolvedIps.slice(0, 2).map((ip) => (
                      <div key={ip} className="font-mono">
                        {ip}
                      </div>
                    ))}
                    {entry.resolvedIps.length > 2 && (
                      <div className="text-muted-foreground">+{entry.resolvedIps.length - 2} more</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs max-w-xs truncate">{entry.comment}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={entry.status} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={entry.paloStatus} />
                </td>
                <td className="px-4 py-3 text-xs">{new Date(entry.expiresAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {entry.paloStatus === "ERROR" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleResync(entry.id)}
                        disabled={loading === entry.id}
                        title="Resync"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleExtend(entry.id, 1)}
                      disabled={loading === entry.id}
                      title="Extend 1 month"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(entry.id)}
                      disabled={loading === entry.id}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && <div className="text-center py-8 text-muted-foreground">No entries found</div>}
    </div>
  )
}
