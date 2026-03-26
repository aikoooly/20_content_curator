import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import {
  buildTwitterAdaptPrompt,
  buildRedditAdaptPrompt,
  buildXHSAdaptPrompt,
} from "@/lib/prompts";
import type { AppliedSuggestions, TwitterAdapt, RedditAdapt, XHSAdapt } from "@/lib/types";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── XML helpers ─────────────────────────────────────────────────

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}>[\\s\\S]*?<\\/${name}>`, "i"));
  if (!m) return null;
  // strip the tags themselves, trim surrounding whitespace
  return m[0].replace(new RegExp(`^<${name}>`, "i"), "").replace(new RegExp(`<\\/${name}>$`, "i"), "").trim();
}

function tagList(xml: string, name: string): string[] {
  const val = tag(xml, name);
  if (!val) return [];
  return val.split("|").map((s) => s.trim()).filter(Boolean);
}

function tagInt(xml: string, name: string): number {
  const val = tag(xml, name);
  if (!val) return 0;
  const n = parseInt(val.trim(), 10);
  return isNaN(n) ? 0 : n;
}

// ─── Per-platform parsers ─────────────────────────────────────────

type ParseResult<T> =
  | { ok: true; result: T }
  | { ok: false; parseError: string };

function parseTwitter(raw: string): ParseResult<TwitterAdapt> {
  const content = tag(raw, "content");
  if (!content) return { ok: false, parseError: "Missing <content> tag" };
  return {
    ok: true,
    result: {
      content,
      changes_made: tagList(raw, "changes"),
      change_percentage: tagInt(raw, "change_percentage"),
    },
  };
}

function parseReddit(raw: string): ParseResult<RedditAdapt> {
  const content = tag(raw, "content");
  const title = tag(raw, "title") ?? "";
  if (!content) return { ok: false, parseError: "Missing <content> tag" };
  return {
    ok: true,
    result: {
      content,
      title,
      subreddits: tagList(raw, "subreddits"),
      changes_made: tagList(raw, "changes"),
      change_percentage: tagInt(raw, "change_percentage"),
    },
  };
}

function parseXHS(raw: string): ParseResult<XHSAdapt> {
  const content = tag(raw, "content");
  const title = tag(raw, "title") ?? "";
  if (!content) return { ok: false, parseError: "Missing <content> tag" };
  return {
    ok: true,
    result: {
      content,
      title,
      keywords: tagList(raw, "keywords"),
      changes_made: tagList(raw, "changes"),
      change_percentage: tagInt(raw, "change_percentage"),
    },
  };
}

const parsers = { twitter: parseTwitter, reddit: parseReddit, xiaohongshu: parseXHS } as const;

// ─── Claude call ──────────────────────────────────────────────────

async function callClaude(systemPrompt: string, userMessage: string): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    temperature: 0,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text;
}

// ─── Route ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { draft, strategy, platform, applied_suggestions, reframe_instructions } =
      await req.json() as {
        draft: string;
        strategy: string;
        platform: "twitter" | "reddit" | "xiaohongshu";
        applied_suggestions: AppliedSuggestions;
        reframe_instructions?: string;
      };

    if (!draft?.trim()) return NextResponse.json({ error: "Draft is required" }, { status: 400 });
    if (!strategy?.trim()) return NextResponse.json({ error: "Strategy is required" }, { status: 400 });
    if (!platform) return NextResponse.json({ error: "Platform is required" }, { status: 400 });

    const promptBuilders = {
      twitter: buildTwitterAdaptPrompt,
      reddit: buildRedditAdaptPrompt,
      xiaohongshu: buildXHSAdaptPrompt,
    };

    const systemPrompt = promptBuilders[platform](strategy, reframe_instructions);
    const userMessage = JSON.stringify({ draft, applied_suggestions: applied_suggestions ?? {} });
    const parse = parsers[platform] as (raw: string) => ParseResult<TwitterAdapt | RedditAdapt | XHSAdapt>;

    console.log(`[adapt:${platform}] calling Claude`);
    let raw = await callClaude(systemPrompt, userMessage);
    console.log(`[adapt:${platform}] raw (${raw.length} chars):`, raw.slice(0, 300));

    let parsed = parse(raw);

    if (!parsed.ok) {
      console.log(`[adapt:${platform}] parse failed: ${parsed.parseError} — retrying`);
      raw = await callClaude(systemPrompt, userMessage);
      console.log(`[adapt:${platform}] retry raw (${raw.length} chars):`, raw.slice(0, 300));
      parsed = parse(raw);
    }

    if (!parsed.ok) {
      return NextResponse.json({
        error: `${platform} 解析失败`,
        platform,
        raw_response: raw,
        parse_error: parsed.parseError,
      }, { status: 500 });
    }

    return NextResponse.json(parsed.result);
  } catch (err) {
    console.error("[/api/adapt] error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "未知错误，请重试" },
      { status: 500 }
    );
  }
}
