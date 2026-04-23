import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildAnalyzePrompt } from "@/lib/prompts";
import type { AnalysisResult } from "@/lib/types";

// Ensure this route is always rendered at request time, never prerendered
// (so `process.env` is read from the running function, not the build).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. In Vercel: Project → Settings → Environment Variables, add it for Production (and Preview / Development as needed), then redeploy."
    );
  }
  return new Anthropic({ apiKey });
}

function parseJSON(raw: string): AnalysisResult | null {
  const candidates: string[] = [];

  let stripped = raw.trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  candidates.push(stripped);

  const first = raw.indexOf("{");
  const last = raw.lastIndexOf("}");
  if (first !== -1 && last > first) {
    candidates.push(raw.slice(first, last + 1));
  }

  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate) as AnalysisResult;
    } catch {
      // try next
    }
  }
  return null;
}

async function callClaude(client: Anthropic, draft: string, strategy: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    temperature: 0,
    system: buildAnalyzePrompt(strategy),
    messages: [{ role: "user", content: draft }],
  });
  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}

export async function POST(req: NextRequest) {
  try {
    const { draft, strategy } = await req.json() as { draft: string; strategy: string };

    if (!draft?.trim()) return NextResponse.json({ error: "Draft is required" }, { status: 400 });
    if (!strategy?.trim()) return NextResponse.json({ error: "Strategy is required" }, { status: 400 });

    const client = getClient();

    let raw = await callClaude(client, draft, strategy);
    let result = parseJSON(raw);

    if (!result) {
      raw = await callClaude(client, draft, strategy);
      result = parseJSON(raw);
    }

    if (!result) {
      return NextResponse.json({ error: "JSON 解析失败，请重试" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/analyze] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "未知错误，请重试" },
      { status: 500 }
    );
  }
}
