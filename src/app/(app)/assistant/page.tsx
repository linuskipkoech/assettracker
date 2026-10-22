import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { isAiConfigured } from "@/lib/ai/client";
import { AiChat } from "@/components/ai-chat";
import { PlantingAdviceTool } from "@/components/planting-advice-tool";
import { PageHeader } from "@/components/ui/page-header";

export default async function AssistantPage() {
  const user = await requireUser();
  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, user.id))
    .orderBy(asc(chatMessages.createdAt));

  return (
    <div className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader
        title="AI Assistant"
        description={
          <>
            General guidance on your portfolio and Kenyan agriculture. For decisions
            with real money on the line, pair this with a{" "}
            <Link href="/advisors" className="text-primary font-medium">professional advisor</Link>.
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AiChat initialMessages={history} aiConfigured={isAiConfigured()} />
        <PlantingAdviceTool />
      </div>
    </div>
  );
}
