import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { sanitizeCtaForFunnel } from "@/lib/funnel-rules";
import {
  buildFunnelStrategyFromContext,
  buildFunnelStrategyPromptBlock,
  validateFunnelStrategyProjectIsolation,
  validateItemAgainstFunnelStrategy,
  normalizeFunnelStage,
  FunnelStrategy,
} from "@/lib/funnel-strategy";
import { resolveGeminiApiKey, missingGeminiApiKeyMessage } from "@/lib/gemini-api-key";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const apiKey = resolveGeminiApiKey(req);
    if (!apiKey) {
      return NextResponse.json(
        { error: missingGeminiApiKeyMessage },
        { status: 403 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const { item, instruction, coreTopic, sharedContentContext, funnelStrategy: providedFunnelStrategy } = await req.json();

    if (!item) {
      return NextResponse.json({ error: "Missing content item to revise" }, { status: 400 });
    }

    if (!sharedContentContext || !sharedContentContext.brand_context?.brand_name?.trim()) {
      return NextResponse.json(
        { error: "Shared Content Context tidak valid atau tidak memiliki data Brand. Tidak dapat meregenerasi konten." },
        { status: 400 }
      );
    }

    const itemProjectId = item.project_id || item.projectId || sharedContentContext.project_id;
    if (itemProjectId && sharedContentContext.project_id && itemProjectId !== sharedContentContext.project_id) {
      return NextResponse.json(
        { error: `Mismatch Project Context: Item project (${itemProjectId}) berbeda dengan context (${sharedContentContext.project_id}).` },
        { status: 400 }
      );
    }

    const resolvedProjectId = itemProjectId || sharedContentContext.project_id;

    // Establish authoritative FunnelStrategy for this project
    let activeFunnelStrategy: FunnelStrategy;
    if (providedFunnelStrategy) {
      const isolationCheck = validateFunnelStrategyProjectIsolation(providedFunnelStrategy, resolvedProjectId);
      if (!isolationCheck.isValid) {
        return NextResponse.json(
          { error: isolationCheck.error || "Project isolation violation in FunnelStrategy." },
          { status: 400 }
        );
      }
      activeFunnelStrategy = providedFunnelStrategy;
    } else {
      activeFunnelStrategy = buildFunnelStrategyFromContext(sharedContentContext, {
        campaignGoal: coreTopic || sharedContentContext.strategy_context?.core_message,
      });
    }

    const brandName = sharedContentContext.brand_context.brand_name;
    const mainOffer = sharedContentContext.strategy_context?.main_offer || "";
    const coreMessage = sharedContentContext.strategy_context?.core_message || coreTopic || "";
    const stageType = normalizeFunnelStage(item.jenis);
    const stageStrategy = activeFunnelStrategy[stageType.toLowerCase() as 'tofu' | 'mofu' | 'bofu'];

    const prompt = `Rewrite and selectively improve the following content calendar item based on the user's specific revision instruction.

### STRATEGY CONTEXT:
- Brand: ${brandName}
- Category: ${sharedContentContext.brand_context.category || '-'}
- Brand Voice: ${sharedContentContext.brand_context.brand_voice || '-'}
- Positioning / USP: ${sharedContentContext.strategy_context?.positioning || '-'}
- Main Offer: ${mainOffer}
- Core Campaign Topic / Message: ${coreMessage}

### AUTHORITATIVE FUNNEL STRATEGY (PROJECT DIRECTIVES):
${buildFunnelStrategyPromptBlock(activeFunnelStrategy)}

### STAGE-SPECIFIC COMPLIANCE DIRECTIVES (${stageType}):
- Audience State: ${stageStrategy.audience_state}
- Objective: ${stageStrategy.objective}
- Message Direction: ${stageStrategy.message_direction}
- Content Style: ${stageStrategy.content_direction}
- Hook Direction: ${stageStrategy.hook_direction}
- CTA Direction: ${stageStrategy.cta_direction}
- Allowed CTA Types: ${stageStrategy.allowed_cta_types.join(', ')}
- Forbidden Elements: ${stageStrategy.forbidden_elements.join('; ')}

### CURRENT ITEM DETAILS:
- Item No: #${item.no}
- Scheduled Date: ${item.tanggal}
- Funnel Stage: ${item.jenis}
- Current Strategic Objective: ${item.tujuan || "Not set"}
- Current Hook Type: ${item.hookType || "Not set"}
- Current Headline: ${item.headline}
- Current Body Copy: ${item.body}
- Current Caption: ${item.caption}
- Current Format: ${item.format}
- Current Visual Direction: ${item.visual}
- Current CTA: ${item.cta || "Link Bio"}
- Current Strategic Rationale: ${item.keterangan}

### USER REVISION INSTRUCTION:
"${instruction}"

### REVISION RULES:
1. Preserve date ("tanggal"), format ("format"), and funnel stage ("jenis") UNLESS the user explicitly requests to change them. Do NOT change a MOFU or TOFU item into BOFU style unless requested.
2. Ensure the revised headline, body, caption, CTA, and visual direction strictly adhere to the project's authoritative funnel stage directives above.
   - TOFU: Focus on pain points, relatable hooks. Absolutely NO sales/closing CTAs.
   - MOFU: Focus on positioning, framework, overcoming objections. Absolutely NO sales/hard closing CTAs.
   - BOFU: Focus directly on offer conversion, proof, and closing.
3. Ensure the revised headline, body, caption, and visual direction directly fulfill the user's revision instruction.
4. Keep the content in natural, engaging Bahasa Indonesia aligned with the brand voice.
5. Update "keterangan" to explain why this revised version fulfills both the funnel stage objective and the user's instruction.
6. Do NOT output generic placeholder text. Produce ready-to-use marketing copy.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert copywriter and funnel strategist for ALCO Content Engine. Selectively revise the item while maintaining strict alignment with the strategy blueprint.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            no: { type: Type.INTEGER },
            tanggal: { type: Type.STRING },
            jenis: { type: Type.STRING },
            tujuan: { type: Type.STRING },
            hookType: { type: Type.STRING },
            headline: { type: Type.STRING },
            body: { type: Type.STRING },
            caption: { type: Type.STRING },
            format: { type: Type.STRING },
            referensi: { type: Type.STRING },
            visual: { type: Type.STRING },
            keterangan: { type: Type.STRING },
            cta: { type: Type.STRING },
            channel: { type: Type.STRING },
          },
          required: ["no", "tanggal", "jenis", "tujuan", "headline", "body", "caption", "format", "visual", "keterangan"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const finalStage = parsed.jenis || item.jenis || "TOFU";
    const rawCta = parsed.cta || item.cta || "";
    const validation = validateItemAgainstFunnelStrategy({ ...item, ...parsed, jenis: finalStage, cta: rawCta }, activeFunnelStrategy);
    const sanitizedCta = validation.repairedCta || sanitizeCtaForFunnel(rawCta, finalStage);

    return NextResponse.json({
      item: {
        ...item,
        ...parsed,
        project_id: resolvedProjectId,
        projectId: resolvedProjectId,
        content_item_id: item.content_item_id,
        cta: sanitizedCta,
        isManualEdited: false // updated via AI revision
      }
    });
  } catch (error: any) {
    console.error("Regenerate Item API Error:", error);

    const errMsg = String(error?.message || error || "");
    const errStatus = error?.status || error?.statusCode || 500;

    const isRateLimit = errStatus === 429 || errStatus === 503 ||
                         /429/i.test(errMsg) || /503/i.test(errMsg) ||
                         /rate.*exceed/i.test(errMsg) ||
                         /quota/i.test(errMsg) ||
                         /resource.*exhaust/i.test(errMsg) ||
                         /high.*demand/i.test(errMsg) ||
                         /overloaded/i.test(errMsg) ||
                         /unavailable/i.test(errMsg) ||
                         /limit.*exceed/i.test(errMsg);

    if (isRateLimit) {
      return NextResponse.json(
        { 
          error: "Permintaan AI sedang dibatasi (Rate Limit / High Demand). Coba lagi beberapa saat.",
          isRateLimit: true,
          details: errMsg
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to regenerate item" },
      { status: 500 }
    );
  }
}
