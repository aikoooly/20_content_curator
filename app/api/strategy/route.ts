import { NextRequest, NextResponse } from "next/server";
import { getStrategy, saveStrategy } from "@/lib/storage";

export async function GET() {
  try {
    const content = getStrategy();
    return NextResponse.json({ content });
  } catch (err) {
    console.error("[/api/strategy GET] error:", err);
    return NextResponse.json(
      { error: "Failed to load strategy" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content } = body as { content: string };

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Content must be a string" },
        { status: 400 }
      );
    }

    saveStrategy(content);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/strategy POST] error:", err);
    return NextResponse.json(
      { error: "Failed to save strategy" },
      { status: 500 }
    );
  }
}
