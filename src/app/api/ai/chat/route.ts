import { NextResponse } from "next/server";
import { z } from "zod";
import type { Content } from "@google/generative-ai";
import { runAgAssistant } from "@/lib/services/gemini";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { buildWhatsAppLink } from "@/lib/constants";

const schema = z.object({
  sessionId: z.string().min(1),
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        text: z.string(),
      }),
    )
    .max(20)
    .default([]),
});

/**
 * Frontend -> here -> Gemini (via runAgAssistant, which owns the system prompt and
 * tool-calling loop). GEMINI_API_KEY only ever lives on the server (see gemini.ts's
 * `import "server-only"`).
 */
export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { sessionId, message, history } = parsed.data;
  const supabase = createAdminSupabaseClient();

  await supabase.from("chat_logs").insert({ session_id: sessionId, role: "user", message });

  const geminiHistory: Content[] = history.map((h) => ({
    role: h.role,
    parts: [{ text: h.text }],
  }));

  try {
    const { reply, cartActions } = await runAgAssistant({ message, history: geminiHistory });

    await supabase.from("chat_logs").insert({ session_id: sessionId, role: "model", message: reply });

    return NextResponse.json({ reply, cartActions });
  } catch (err) {
    console.error("AI chat failed", err);

    const fallback =
      "I'm having trouble reaching the assistant right now. You can also reach AG Enterprises directly on WhatsApp.";
    await supabase.from("chat_logs").insert({
      session_id: sessionId,
      role: "model",
      message: fallback,
      resolved: false,
    });

    return NextResponse.json({
      reply: fallback,
      cartActions: [],
      whatsappLink: buildWhatsAppLink("Namaste AG Enterprises, mujhe apne order mein help chahiye."),
    });
  }
}
