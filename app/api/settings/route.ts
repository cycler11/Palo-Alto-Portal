import { type NextRequest, NextResponse } from "next/server"
import { storage } from "@/lib/storage"

export async function GET() {
  return NextResponse.json(storage.getSettings())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  storage.updateSettings(body)
  return NextResponse.json(storage.getSettings())
}
