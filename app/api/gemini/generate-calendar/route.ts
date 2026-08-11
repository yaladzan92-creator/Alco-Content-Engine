import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import {
  GenerateCalendarRequest,
  horizonToCount,
  inferPlanningHorizon,
  buildSharedContentContext,
  SharedContentContext
} from "@/lib/content-contract";

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

    const bodyData = await req.json() as GenerateCalendarRequest;
    const {
      coreTopic = "Brand Strategy Launch Campaign",
      startDate = new Date().toISOString().split('T')[0],
      skipDays = [],
      gender = "Both",
      ageRange = [18, 45],
      ratio = { tofu: 8, mofu: 6, bofu: 4 },
      formats = ["Single", "Carousel", "Reels"],
      carouselSlides = 5,
      reelsDuration = "30s",
      selectedVoices = ["Empathetic & Authoritative"],
      selectedFormula = "Awareness & Soft Selling",
      selectedCTAs = ["Link Bio", "DM Us"],
      hookMix = [],
      referenceType = "ALCO Engine Logic",
      planningHorizon,
      channels = ["instagram", "facebook"],
      strategyBlueprint,
      sharedContentContext: providedContext,
    } = bodyData;

    // Build or refine Shared Content Context
    let context: SharedContentContext;
    if (providedContext) {
      context = providedContext;
    } else if (strategyBlueprint) {
      context = buildSharedContentContext(strategyBlueprint, 'creative_system_json');
    } else {
      // Fallback manual context if no blueprint uploaded
      context = {
        project_id: `manual_${Date.now()}`,
        project_name: coreTopic,
        source: { origin: 'manual_context' },
        brand_context: {
          brand_name: coreTopic || "ALCO Client Brand",
          category: "General Business",
          brand_summary: `Campaign centered on: ${coreTopic}`,
          brand_voice: selectedVoices.join(', ') || "Professional & Direct",
        },
        audience_context: {
          primary_audience: `Target Audience (${gender}, Age ${ageRange[0]}-${ageRange[1]})`,
          pain_points: ["Kesulitan menemukan solusi yang terbukti", "Tidak punya cukup waktu"],
          desires: ["Hasil nyata yang efisien dan terukur"],
          objections: ["Apakah solusi ini benar-benar efisien?"],
        },
        strategy_context: {
          positioning: coreTopic,
          usp: ["Strategi terarah", "Hasil efisien"],
          main_offer: "Akses produk / layanan utama",
          offer_benefits: ["Solusi instan", "Nilai jangka panjang"],
          core_message: coreTopic,
          copy_direction: ["Gunakan hook kuat", "Fokus ke masalah dan solusi"],
          content_pillars: ["Edukasi & Problem Awareness", "Solusi & Social Proof", "Penawaran & Direct Action"],
        },
        system_flags: {
          is_complete_for_planning: false,
          missing_required_fields: ["Minimal Blueprint Upload disarankan untuk hasil maksimal"],
        },
      };
    }

    const normalizedHorizon = inferPlanningHorizon(planningHorizon);
    const ratioTotal = (ratio.tofu || 0) + (ratio.mofu || 0) + (ratio.bofu || 0);
    const totalPosts = ratioTotal > 0 ? ratioTotal : horizonToCount[normalizedHorizon];

    const hookMixText = Array.isArray(hookMix) && hookMix.length > 0
      ? hookMix.map((h: any) => `${h.type || h} (${h.percentage || 0}%)`).join(', ')
      : 'Call-Out (40%), Curiosity Gap (35%), Social Proof (25%)';

    const prompt = `Act as an Elite Brand Content Director for ALCO Content Engine.

Your task is to synthesize a high-converting, strategy-first Content Calendar Matrix based on the provided Shared Content Context and parameters.

### STRATEGY BLUEPRINT & SHARED CONTENT CONTEXT:
- Brand Name: ${context.brand_context.brand_name}
- Category: ${context.brand_context.category}
- Brand Voice & Tone: ${context.brand_context.brand_voice}
- Core Positioning / USP: ${context.strategy_context.positioning} | USP: ${context.strategy_context.usp.join('; ')}
- Target Audience: ${context.audience_context.primary_audience}
- Audience Pain Points: ${context.audience_context.pain_points.join('; ')}
- Audience Desires: ${context.audience_context.desires.join('; ')}
- Audience Objections: ${context.audience_context.objections.join('; ')}
- Core Message: ${context.strategy_context.core_message}
- Main Offer & Benefits: ${context.strategy_context.main_offer} (${context.strategy_context.offer_benefits.join('; ')})
- Content Pillars: ${context.strategy_context.content_pillars.join('; ')}
- Copy Direction: ${context.strategy_context.copy_direction.join('; ')}

### CAMPAIGN EXECUTION PARAMETERS:
- Core Topic / Focus: ${coreTopic}
- Start Date: ${startDate}
- Skip Days of Week: ${skipDays.join(', ') || 'None'}
- Target Channels: ${channels.join(', ')}
- Requested Funnel Allocation: ${ratio.tofu} TOFU (Top of Funnel - Awareness), ${ratio.mofu} MOFU (Middle of Funnel - Consideration), ${ratio.bofu} BOFU (Bottom of Funnel - Conversion)
- Allowed Formats: ${formats.join(', ')} (Carousel slides: ${carouselSlides}, Reels duration: ${reelsDuration})
- Primary Formula / Angle: ${selectedFormula}
- Primary CTAs Allowed: ${selectedCTAs.join(', ')}
- Hook Mix Strategy: ${hookMixText}
- Reference Logic: ${referenceType}

### MANDATORY GUIDELINES:
1. Generate EXACTLY ${totalPosts} post items in sequential order (1 to ${totalPosts}).
2. Calculate dates strictly starting from "${startDate}", skipping excluded days (${skipDays.join(', ') || 'none'}). Format: "YYYY-MM-DD".
3. Maintain the requested funnel ratio: ~${ratio.tofu} TOFU, ~${ratio.mofu} MOFU, ~${ratio.bofu} BOFU items.
   - TOFU (Awareness): Focus on audience pain points, myths, relational hooks, and broad problem recognition. Soft or zero sales pressure.
   - MOFU (Consideration): Focus on positioning, core message, USP, framework/how-to, handling objections, and building trust.
   - BOFU (Conversion): Focus directly on main offer, product benefits, social proof, urgency, and direct CTA (Link Bio, DM, Order).
4. Every single item MUST have a clear strategic daily objective ("tujuan") specifying what business/funnel goal this post accomplishes today.
5. Every single item MUST have a strategic rationale ("keterangan") explaining why this specific content belongs in its designated funnel stage.
6. Headlines, Body, Visual Prompt, and Captions MUST be written in natural, persuasive Bahasa Indonesia matching the Brand Voice.
7. Avoid generic filler captions, repetitive headlines, or random CTAs that don't match the funnel stage.
8. Visual prompt ("visual") should be an actionable instruction for graphic design or video creation (e.g., slide breakdown for Carousel, scene script for Reels).
9. For each item, recommend the best asset types for production (choose from: "image", "carousel", "video"). You may recommend 1-3 types in \`recommendedAssetTypes\`, but you MUST select exactly one \`primaryAssetType\`, and provide strategic reasoning in \`assetTypeReason\`.

Return ONLY the JSON matching the specified schema.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are the ALCO Content Engine AI. You convert business strategy blueprints into detailed, funnel-aware content calendars. Output structured JSON strictly adhering to the schema.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  no: { type: Type.INTEGER },
                  tanggal: { type: Type.STRING },
                  jenis: { type: Type.STRING, description: "Funnel Stage e.g. TOFU (Awareness), MOFU (Consideration), or BOFU (Conversion)" },
                  tujuan: { type: Type.STRING, description: "Daily strategic funnel objective" },
                  hookType: { type: Type.STRING, description: "e.g. Call-Out, Curiosity Gap, Negativity Bias, Social Proof" },
                  headline: { type: Type.STRING, description: "Catchy headline / hook text" },
                  body: { type: Type.STRING, description: "Detailed script, slide breakdown, or main body copy" },
                  caption: { type: Type.STRING, description: "Ready-to-publish caption with hashtags & line breaks" },
                  format: { type: Type.STRING, description: "Single, Carousel, or Reels" },
                  recommendedAssetTypes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. ['image', 'carousel', 'video']" },
                  primaryAssetType: { type: Type.STRING, description: "The single best asset type (image, carousel, or video)" },
                  assetTypeReason: { type: Type.STRING, description: "Strategic reasoning for the primary asset type" },
                  referensi: { type: Type.STRING, description: "Formula or reference strategy used" },
                  visual: { type: Type.STRING, description: "Visual prompt / video scene design direction" },
                  keterangan: { type: Type.STRING, description: "Strategic explanation for why this item fits its funnel stage" },
                  channel: { type: Type.STRING, description: "Instagram, Facebook, or Instagram & Facebook" },
                  cta: { type: Type.STRING, description: "Call to Action text" },
                  carousel_plan: {
                    type: Type.OBJECT,
                    description: "Structured plan for carousel items",
                    properties: {
                      content_goal: { type: Type.STRING },
                      funnel_stage: { type: Type.STRING },
                      current_belief: { type: Type.STRING },
                      desired_belief: { type: Type.STRING },
                      core_promise: { type: Type.STRING },
                      primary_cta_type: { type: Type.STRING, description: "save, share, comment, follow, or click" },
                      primary_cta_text: { type: Type.STRING },
                      slide_count: { type: Type.INTEGER },
                      slide_count_reason: { type: Type.STRING },
                      belief_journey_summary: { type: Type.STRING },
                      visual_system_notes: { type: Type.STRING },
                      slides: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            slide: { type: Type.INTEGER },
                            role: { type: Type.STRING, description: "hook, recognition, reframe, mechanism, insight, framework, proof, cta, or custom" },
                            communication_job: { type: Type.STRING },
                            headline: { type: Type.STRING },
                            body: { type: Type.STRING },
                            swipe_bridge: { type: Type.STRING },
                            emotional_state: { type: Type.STRING },
                            visual_intent: { type: Type.STRING },
                            visual_type: { type: Type.STRING, description: "scene, diagram, comparison, checklist, quote, stat, ui-mock, or custom" },
                            text_zone: { type: Type.STRING },
                            negative_space_plan: { type: Type.STRING },
                          },
                          required: ["slide", "role", "communication_job", "headline", "body", "visual_intent"]
                        }
                      }
                    },
                    required: ["content_goal", "funnel_stage", "current_belief", "desired_belief", "core_promise", "primary_cta_type", "primary_cta_text", "slide_count", "slide_count_reason", "belief_journey_summary", "visual_system_notes", "slides"]
                  }
                },
                required: ["no", "tanggal", "jenis", "tujuan", "headline", "body", "caption", "format", "visual", "keterangan", "recommendedAssetTypes", "primaryAssetType", "assetTypeReason"]
              }
            },
            growthItems: {
              type: Type.ARRAY,
              items: {
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
                  recommendedAssetTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
                  primaryAssetType: { type: Type.STRING },
                  assetTypeReason: { type: Type.STRING },
                  referensi: { type: Type.STRING },
                  visual: { type: Type.STRING },
                  keterangan: { type: Type.STRING },
                  channel: { type: Type.STRING },
                  cta: { type: Type.STRING },
                }
              }
            }
          },
          required: ["items"]
        }
      }
    });

    const parsed = JSON.parse(response.text || '{"items":[]}');
    return NextResponse.json({
      items: parsed.items || [],
      growthItems: parsed.growthItems || [],
      contextSummary: {
        brandName: context.brand_context.brand_name,
        primaryAudience: context.audience_context.primary_audience,
        mainOffer: context.strategy_context.main_offer,
        isComplete: context.system_flags.is_complete_for_planning,
      }
    });
  } catch (error: any) {
    console.error("Generate Calendar API Error:", error);

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
      { error: error.message || "Failed to generate content calendar" },
      { status: 500 }
    );
  }
}
