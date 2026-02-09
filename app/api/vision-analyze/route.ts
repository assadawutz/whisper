import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, apiKey } = await req.json();

    if (!imageBase64 || !apiKey) {
      return NextResponse.json(
        { error: "Missing imageBase64 or apiKey" },
        { status: 400 },
      );
    }

    const systemPrompt = `You are a UI/UX expert analyzer. Analyze the provided UI image and extract its structure.

Return a JSON object with this EXACT format:
{
  "description": "Brief description of what this UI is (e.g., 'E-commerce product page')",
  "components": [
    { "type": "button", "count": 3, "examples": ["Add to Cart", "Buy Now", "Share"] },
    { "type": "card", "count": 4, "examples": ["Product card"] }
  ],
  "layout": {
    "type": "single-column" | "two-column" | "grid" | "hero" | "dashboard" | "form" | "unknown",
    "sections": ["Header", "Hero Banner", "Product Grid", "Footer"]
  },
  "colors": {
    "primary": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex"
  },
  "typography": {
    "headings": "Bold, large (32-48px)",
    "body": "Regular, medium (14-16px)"
  },
  "suggestions": [
    "Use Tailwind flex for layout",
    "Consider grid-cols-3 for product cards"
  ]
}

Be precise and return ONLY valid JSON.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(apiKey)}`;

    // Clean base64 data
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt },
              {
                inlineData: {
                  mimeType: "image/png",
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Gemini API Error:", errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${res.status}` },
        { status: 500 },
      );
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: "No response from Vision API" },
        { status: 500 },
      );
    }

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json(
          { error: "Failed to parse response as JSON" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ analysis });
  } catch (err: any) {
    console.error("Vision Analyze Error:", err);
    return NextResponse.json(
      { error: err.message || "Unknown error" },
      { status: 500 },
    );
  }
}
