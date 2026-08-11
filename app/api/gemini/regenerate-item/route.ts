import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is missing" },
        { status: 500 }
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

    const { item, instruction, coreTopic, sharedContentContext } = await req.json();

    if (!item) {
      return NextResponse.json({ error: "Missing content item to revise" }, { status: 400 });
    }

    const brandName = sharedContentContext?.brand_context?.brand_name || "ALCO Client";
    const mainOffer = sharedContentContext?.strategy_context?.main_offer || "Product/Service";
    const coreMessage = sharedContentContext?.strategy_context?.core_message || coreTopic || "General Campaign";

    const prompt = `Rewrite and selectively improve the following content calendar item based on the user's specific revision instruction.

### STRATEGY CONTEXT:
- Brand: ${brandName}
- Main Offer: ${mainOffer}
- Core Campaign Topic / Message: ${coreMessage}

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
1. Preserve date ("tanggal"), format ("format"), and funnel stage ("jenis") UNLESS the user explicitly requests to change them.
2. Ensure the revised headline, body, caption, and visual direction directly fulfill the user's revision instruction.
3. Keep the content in natural, engaging Bahasa Indonesia aligned with the brand voice.
4. Update "keterangan" to explain why this revised version fulfills both the funnel stage objective and the user's instruction.
5. Do NOT output generic placeholder text. Produce ready-to-use marketing copy.`;

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
    return NextResponse.json({
      item: {
        ...item,
        ...parsed,
        isManualEdited: false // updated via AI revision
      }
    });
  } catch (error: any) {
    console.error("Regenerate Item API Error:", error);

    const errMsg = String(error?.message || error || "");
    const errStatus = error?.status || error?.statusCode || 500;

    const isRateLimit = errStatus === 429 || 
                        /429/i.test(errMsg) || 
                        /rate.*exceed/i.test(errMsg) || 
                        /quota/i.test(errMsg) || 
                        /resource.*exhaust/i.test(errMsg) || 
                        /limit.*exceed/i.test(errMsg);

    if (isRateLimit) {
      return NextResponse.json(
        { 
          error: "Permintaan AI sedang dibatasi (Rate Limit / Quota Exceeded). Coba lagi beberapa saat.",
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
