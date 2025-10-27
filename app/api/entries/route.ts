import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { resolveDomain, isValidIP, isValidDomain } from "@/lib/dns-resolver"
import { syncToPaloAlto } from "@/lib/palo-alto-mock"
import type { BlockingEntry, AuditLog } from "@/lib/types"

export async function GET() {
  const entries = storage.getEntries()
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { input, comment, expiresIn } = body

    if (!input || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let kind: "ip" | "domain" = "ip"
    let resolvedIps: string[] = []

    if (isValidIP(input)) {
      kind = "ip"
      resolvedIps = [input]
    } else if (isValidDomain(input)) {
      kind = "domain"
      resolvedIps = await resolveDomain(input)
    } else {
      return NextResponse.json({ error: "Invalid IP or domain" }, { status: 400 })
    }

    const expiresAt = Date.now() + (expiresIn || 30 * 24 * 60 * 60 * 1000) // default 30 days

    const entry: BlockingEntry = {
      id: Math.random().toString(36).substr(2, 9),
      input,
      kind,
      resolvedIps,
      comment,
      expiresAt,
      status: "PENDING",
      paloStatus: "QUEUED",
      createdBy: "operator",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    storage.addEntry(entry)

    // Log action
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      entryId: entry.id,
      action: "CREATE",
      details: { input, kind, resolvedIps },
      actor: "operator",
      createdAt: Date.now(),
    }
    storage.addAuditLog(log)

    // Try to sync to Palo Alto
    const settings = storage.getSettings()
    const syncResult = await syncToPaloAlto(entry, settings)

    if (syncResult.success) {
      storage.updateEntry(entry.id, { status: "ACTIVE", paloStatus: "SYNCED" })
      storage.addAuditLog({
        id: Math.random().toString(36).substr(2, 9),
        entryId: entry.id,
        action: "SYNC_SUCCESS",
        actor: "system",
        createdAt: Date.now(),
      })
    } else {
      storage.updateEntry(entry.id, { status: "FAILED", paloStatus: "ERROR" })
      storage.addAuditLog({
        id: Math.random().toString(36).substr(2, 9),
        entryId: entry.id,
        action: "SYNC_FAILED",
        details: { error: syncResult.error },
        actor: "system",
        createdAt: Date.now(),
      })
    }

    return NextResponse.json(storage.getEntry(entry.id))
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
