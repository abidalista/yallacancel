import { NextRequest, NextResponse } from "next/server";
import { analyzeStatementFiles } from "@/lib/server/statement-analysis";
import { CLAUDE_MODEL, HAIKU_MODEL } from "@/lib/server/jfc-skill";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 6; // combined scans per window
const RATE_WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      const single = formData.get("file");
      if (single instanceof File) files.push(single);
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > 8) {
      return NextResponse.json({ error: "Max 8 files per scan" }, { status: 400 });
    }

    // "teaser" → cheap Haiku (free scan fallback); "full" → Sonnet (paid report)
    const tier = String(formData.get("tier") || "full");
    const model = tier === "teaser" ? HAIKU_MODEL : CLAUDE_MODEL;

    const result = await analyzeStatementFiles(files, model);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analyze failed" },
      { status: 500 }
    );
  }
}
