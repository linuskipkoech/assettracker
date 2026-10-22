import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { withErrorHandling } from "@/lib/api-utils";
import { chatMessageSchema } from "@/lib/validation";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { getAnthropicClient, isAiConfigured, AI_MODEL } from "@/lib/ai/client";
import { ASSISTANT_SYSTEM_PROMPT, buildPortfolioContext } from "@/lib/ai/prompts";
import { listAssetsForUser, summarizeNetWorth } from "@/lib/repositories/assets";
import { isRateLimited } from "@/lib/rate-limit";

const HISTORY_LIMIT = 20;

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, user.id))
      .orderBy(asc(chatMessages.createdAt));
    return NextResponse.json({ messages: history, aiConfigured: isAiConfigured() });
  });
}

export async function POST(req: Request) {
  return withErrorHandling(async () => {
    const user = await requireUser();

    // The AI call is paid per-request, so this is keyed by user (not IP)
    // to cap cost exposure from any single account.
    if (isRateLimited(`ai-chat:${user.id}`, { windowMs: 60 * 1000, max: 15 })) {
      return NextResponse.json(
        { error: "You're sending messages too quickly. Please wait a moment and try again." },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { message } = chatMessageSchema.parse(body);

    await db.insert(chatMessages).values({
      userId: user.id,
      role: "user",
      content: message,
    });

    if (!isAiConfigured()) {
      const offlineReply =
        "The AI assistant isn't connected yet — ask the app owner to add an ANTHROPIC_API_KEY to the .env file. In the meantime, you can still browse and book a professional advisor from the Advisors page.";
      await db.insert(chatMessages).values({
        userId: user.id,
        role: "assistant",
        content: offlineReply,
      });
      return NextResponse.json({ reply: offlineReply, aiConfigured: false });
    }

    const [recentHistory, userAssets] = await Promise.all([
      db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.userId, user.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(HISTORY_LIMIT),
      listAssetsForUser(user.id),
    ]);
    const orderedHistory = recentHistory.reverse();
    const netWorth = summarizeNetWorth(userAssets).total;
    const portfolioContext = buildPortfolioContext(userAssets, netWorth);

    const anthropic = getAnthropicClient();
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      system: `${ASSISTANT_SYSTEM_PROMPT}\n\nThe user's current portfolio:\n${portfolioContext}`,
      messages: orderedHistory.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
    });

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim() || "I couldn't generate a response — please try again.";

    await db.insert(chatMessages).values({
      userId: user.id,
      role: "assistant",
      content: reply,
    });

    return NextResponse.json({ reply, aiConfigured: true });
  });
}
