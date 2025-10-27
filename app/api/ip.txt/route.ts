import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const token = searchParams.get("token")

  const settings = storage.getSettings()

  // Check token if configured
  if (settings.edlToken && token !== settings.edlToken) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const entries = storage.getEntries()
  const now = Date.now()

  // Collect unique IPs from active, non-expired entries
  const ips = new Set<string>()

  entries.forEach((entry) => {
    if (entry.status === "ACTIVE" && entry.expiresAt > now) {
      entry.resolvedIps.forEach((ip) => ips.add(ip))
    }
  })

  // Sort for stability
  const sortedIps = Array.from(ips).sort()
  const content = sortedIps.join("\n") + (sortedIps.length > 0 ? "\n" : "")

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
