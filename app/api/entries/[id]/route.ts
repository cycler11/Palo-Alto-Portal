import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"
import { removePaloAltoEntry, syncToPaloAlto } from "@/lib/palo-alto-mock"

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const entry = storage.getEntry(id)

  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  }

  const settings = storage.getSettings()
  const removeResult = await removePaloAltoEntry(entry, settings)

  if (removeResult.success) {
    storage.updateEntry(id, { status: "REMOVED", paloStatus: "UNSYNCED", removedAt: Date.now() })
    storage.addAuditLog({
      id: Math.random().toString(36).substr(2, 9),
      entryId: id,
      action: "REMOVE",
      actor: "operator",
      createdAt: Date.now(),
    })
    return NextResponse.json({ success: true })
  } else {
    return NextResponse.json({ error: removeResult.error }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const body = await req.json()
  const { action, ...updates } = body

  const entry = storage.getEntry(id)
  if (!entry) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 })
  }

  if (action === "extend") {
    const months = updates.months || 1
    const newExpiry = entry.expiresAt + months * 30 * 24 * 60 * 60 * 1000
    storage.updateEntry(id, { expiresAt: newExpiry })
    storage.addAuditLog({
      id: Math.random().toString(36).substr(2, 9),
      entryId: id,
      action: "EXTEND",
      details: { months, newExpiry },
      actor: "operator",
      createdAt: Date.now(),
    })
  } else if (action === "resync") {
    const settings = storage.getSettings()
    const syncResult = await syncToPaloAlto(entry, settings)
    if (syncResult.success) {
      storage.updateEntry(id, { paloStatus: "SYNCED" })
    } else {
      storage.updateEntry(id, { paloStatus: "ERROR" })
    }
    storage.addAuditLog({
      id: Math.random().toString(36).substr(2, 9),
      entryId: id,
      action: "RESYNC",
      details: { success: syncResult.success },
      actor: "operator",
      createdAt: Date.now(),
    })
  } else {
    storage.updateEntry(id, updates)
  }

  return NextResponse.json(storage.getEntry(id))
}
