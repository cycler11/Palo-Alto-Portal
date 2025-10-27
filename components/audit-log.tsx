"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AuditLog as AuditLogType } from "@/lib/types"

export default function AuditLog() {
  const [logs, setLogs] = useState<AuditLogType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/audit")
      const data = await res.json()
      setLogs(data)
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No audit logs</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground ml-2">by {log.actor}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                {log.details && (
                  <div className="text-xs text-muted-foreground mt-1 font-mono">
                    {JSON.stringify(log.details, null, 2)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
