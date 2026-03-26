// ─── Step 1: Analysis types ───────────────────────────────────────

export interface TwitterAnalysis {
  suggested_hook: string;
  suggested_cta: string;
  format_advice: string;
  platform_score: number;
  score_reasoning: string;
  warnings: string[];
}

export interface RedditAnalysis {
  suggested_title: string;
  suggested_subreddits: string[];
  suggested_hook: string;
  suggested_cta: string;
  format_advice: string;
  platform_score: number;
  score_reasoning: string;
  warnings: string[];
}

export interface XHSAnalysis {
  suggested_title: string;
  suggested_hook: string;
  suggested_cta: string;
  suggested_keywords: string[];
  format_advice: string;
  platform_score: number;
  score_reasoning: string;
  warnings: string[];
}

export interface AnalysisResult {
  twitter: TwitterAnalysis;
  reddit: RedditAnalysis;
  xiaohongshu: XHSAnalysis;
  overall: string;
}

// ─── Step 2: Adapt types ──────────────────────────────────────────

export interface TwitterAdapt {
  content: string;
  changes_made: string[];
  change_percentage: number;
}

export interface RedditAdapt {
  content: string;
  title: string;
  subreddits: string[];
  changes_made: string[];
  change_percentage: number;
}

export interface XHSAdapt {
  content: string;
  title: string;
  keywords: string[];
  changes_made: string[];
  change_percentage: number;
}

export interface AdaptResult {
  twitter: TwitterAdapt;
  reddit: RedditAdapt;
  xiaohongshu: XHSAdapt;
}

// ─── Applied suggestions (passed to /api/adapt) ──────────────────

export interface AppliedSuggestions {
  twitter_hook?: string;
  twitter_cta?: string;
  reddit_title?: string;
  reddit_hook?: string;
  reddit_cta?: string;
  xhs_title?: string;
  xhs_hook?: string;
  xhs_cta?: string;
}

// ─── History ──────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  date: string;
  draft: string;
  draftPreview: string;
  twitterScore: number;
  redditScore: number;
  xhsScore: number;
  analysisResult?: AnalysisResult;
  adaptResult: AdaptResult;
}
