import fs from "fs";
import path from "path";
import type { HistoryEntry } from "./types";

const STORAGE_DIR = "/tmp/content-studio";
const STRATEGY_FILE = path.join(STORAGE_DIR, "strategy.json");
const HISTORY_FILE = path.join(STORAGE_DIR, "history.json");
const MAX_HISTORY = 100;

function ensureDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

function getDefaultStrategy(): string {
  try {
    const defaultPath = path.join(process.cwd(), "data", "default-strategy.md");
    return fs.readFileSync(defaultPath, "utf-8");
  } catch {
    return "# 平台策略文档\n\n（加载默认策略失败，请手动填写）";
  }
}

export function getStrategy(): string {
  try {
    ensureDir();
    if (!fs.existsSync(STRATEGY_FILE)) {
      return getDefaultStrategy();
    }
    const raw = fs.readFileSync(STRATEGY_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed.content ?? getDefaultStrategy();
  } catch {
    return getDefaultStrategy();
  }
}

export function saveStrategy(content: string): void {
  ensureDir();
  fs.writeFileSync(STRATEGY_FILE, JSON.stringify({ content }, null, 2), "utf-8");
}

export function getHistory(): HistoryEntry[] {
  try {
    ensureDir();
    if (!fs.existsSync(HISTORY_FILE)) {
      return [];
    }
    const raw = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry): void {
  ensureDir();
  const history = getHistory();
  const updated = [entry, ...history].slice(0, MAX_HISTORY);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(updated, null, 2), "utf-8");
}

export function clearHistory(): void {
  ensureDir();
  fs.writeFileSync(HISTORY_FILE, JSON.stringify([]), "utf-8");
}
