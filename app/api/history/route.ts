import { NextRequest, NextResponse } from "next/server";
import { getHistory, clearHistory, addHistoryEntry } from "@/lib/storage";
import type { HistoryEntry } from "@/lib/types";

export async function GET() {
  try {
    const history = getHistory();
    return NextResponse.json(history);
  } catch (err) {
    console.error("[/api/history GET] error:", err);
    return NextResponse.json(
      { error: "Failed to load history" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const entry = await req.json() as HistoryEntry;
    addHistoryEntry(entry);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/history POST] error:", err);
    return NextResponse.json({ error: "Failed to save history" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    clearHistory();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/history DELETE] error:", err);
    return NextResponse.json(
      { error: "Failed to clear history" },
      { status: 500 }
    );
  }
}
