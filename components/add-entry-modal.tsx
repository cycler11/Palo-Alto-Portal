"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { isValidIP, isValidDomain, resolveDomain } from "@/lib/dns-resolver"

interface AddEntryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function AddEntryModal({ open, onOpenChange, onSuccess }: AddEntryModalProps) {
  const [input, setInput] = useState("")
  const [comment, setComment] = useState("")
  const [expiresIn, setExpiresIn] = useState("30")
  const [loading, setLoading] = useState(false)
  const [resolvedIps, setResolvedIps] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const { toast } = useToast()

  const handleResolve = async () => {
    if (!input) {
      toast({ title: "Error", description: "Please enter an IP or domain", variant: "destructive" })
      return
    }

    if (isValidIP(input)) {
      setResolvedIps([input])
      setShowPreview(true)
    } else if (isValidDomain(input)) {
      try {
        const ips = await resolveDomain(input)
        setResolvedIps(ips)
        setShowPreview(true)
      } catch (error) {
        toast({ title: "Error", description: "Failed to resolve domain", variant: "destructive" })
      }
    } else {
      toast({ title: "Error", description: "Invalid IP or domain format", variant: "destructive" })
    }
  }

  const handleSubmit = async () => {
    if (!input || !comment || resolvedIps.length === 0) {
      toast({ title: "Error", description: "Please fill all fields and resolve the input", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const expiresInMs = Number.parseInt(expiresIn) * 24 * 60 * 60 * 1000
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, comment, expiresIn: expiresInMs }),
      })

      if (!res.ok) throw new Error("Failed to create entry")

      toast({ title: "Success", description: "Entry created successfully" })
      setInput("")
      setComment("")
      setResolvedIps([])
      setShowPreview(false)
      onOpenChange(false)
      onSuccess()
    } catch (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Blocking Entry</DialogTitle>
          <DialogDescription>Enter an IP address or domain to block</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">IP Address or Domain</label>
            <Input
              placeholder="192.168.1.1 or example.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Comment</label>
            <Textarea
              placeholder="Reason for blocking..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Expires In (days)</label>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">1 Month</SelectItem>
                <SelectItem value="90">3 Months</SelectItem>
                <SelectItem value="180">6 Months</SelectItem>
                <SelectItem value="365">12 Months</SelectItem>
                <SelectItem value="36500">Indefinite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showPreview && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Resolved IPs:</p>
              <div className="space-y-1">
                {resolvedIps.map((ip) => (
                  <div key={ip} className="text-sm text-muted-foreground font-mono">
                    {ip}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            {!showPreview ? (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleResolve} className="flex-1">
                  Resolve & Preview
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Confirm & Add"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
