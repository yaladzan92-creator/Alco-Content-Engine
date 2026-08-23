import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
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

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { prompt, aspectRatio = "1:1" } = body || {};

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json(
        { error: "Prompt image belum tersedia." },
        { status: 400 }
      );
    }

    const rawModel = process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image';
    const model = rawModel.trim();
    const normalizedModel = model.toLowerCase();

    console.log('Generate Image model:', model);

    if (normalizedModel.includes('preview-image')) {
      return NextResponse.json(
        {
          error:
            'GEMINI_IMAGE_MODEL masih memakai model preview-image lama. Hapus env ini atau ganti ke gemini-3.1-flash-image.',
        },
        { status: 400 }
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

    const interaction = await (ai as any).interactions.create({
      model,
      input: prompt,
      response_format: {
        type: 'image',
        mime_type: 'image/jpeg',
        aspect_ratio: aspectRatio || '4:5',
      },
    });

    const base64Data = interaction?.output_image?.data;

    if (!base64Data) {
      return NextResponse.json(
        { error: 'Gemini tidak mengembalikan gambar. Coba prompt yang lebih spesifik atau ganti model image.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageDataUrl: `data:image/jpeg;base64,${base64Data}`,
      model,
      aspectRatio: aspectRatio || '4:5',
    });
  } catch (err: any) {
    console.error("Generate Image API Error:", err);
    const errMsg = String(err?.message || err?.stack || err || "").toLowerCase();
    const errStatus = err?.status || err?.statusCode;

    const isRateLimit =
      errStatus === 429 ||
      errMsg.includes("429") ||
      errMsg.includes("rate") ||
      errMsg.includes("quota") ||
      errMsg.includes("resource_exhausted");

    if (isRateLimit) {
      return NextResponse.json(
        { error: "Kuota image generation Gemini belum tersedia untuk model ini. Cek billing/quota atau ganti GEMINI_IMAGE_MODEL." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Gagal generate image. Coba lagi nanti." },
      { status: 500 }
    );
  }
}
