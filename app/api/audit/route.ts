import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const entryId = searchParams.get("entryId")

  let logs = storage.getAuditLogs()
  if (entryId) {
    logs = logs.filter((l) => l.entryId === entryId)
  }

  return NextResponse.json(logs.sort((a, b) => b.createdAt - a.createdAt))
}
