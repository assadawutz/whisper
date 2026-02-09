import type { LlmOptions } from "../llmTypes";

export interface VisionAnalysisResult {
  description: string;
  components: {
    type: string;
    count: number;
    examples: string[];
  }[];
  layout: {
    type:
      | "single-column"
      | "two-column"
      | "grid"
      | "hero"
      | "dashboard"
      | "form"
      | "unknown";
    sections: string[];
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    headings: string;
    body: string;
  };
  suggestions: string[];
}

/**
 * 👁️ WHISPER VISION ANALYZER
 * Uses Vision LLM to describe UI structure from images.
 */
export async function analyzeImageWithVision(
  imageBase64: string,
  opts: LlmOptions,
): Promise<VisionAnalysisResult> {
  const systemPrompt = `You are a UI/UX expert analyzer. Analyze the provided UI image and extract its structure.

Return a JSON object with this EXACT format:
{
  "description": "Brief description of what this UI is (e.g., 'E-commerce product page')",
  "components": [
    { "type": "button", "count": 3, "examples": ["Add to Cart", "Buy Now", "Share"] },
    { "type": "card", "count": 4, "examples": ["Product card"] },
    ...
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

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(opts.apiKey)}`;

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
                data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
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
    const t = await res.text();
    throw new Error(`Vision API error: ${res.status} ${t}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Vision API");
  }

  try {
    return JSON.parse(text) as VisionAnalysisResult;
  } catch {
    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as VisionAnalysisResult;
    }
    throw new Error("Failed to parse Vision response as JSON");
  }
}

/**
 * 🎯 Analyze image and return structured blueprint
 */
export async function describeUIStructure(
  imageBase64: string,
  apiKey: string,
): Promise<{
  analysis: VisionAnalysisResult;
  blueprint: {
    nodes: Array<{
      id: string;
      role: string;
      description: string;
      estimatedPosition: string;
    }>;
  };
}> {
  const analysis = await analyzeImageWithVision(imageBase64, {
    provider: "gemini",
    apiKey,
    model: "gemini-2.0-flash",
  });

  // Generate blueprint nodes from analysis
  const nodes = analysis.components.flatMap((comp, i) =>
    Array.from({ length: comp.count }, (_, j) => ({
      id: `${comp.type}-${i}-${j}`,
      role: comp.type,
      description: comp.examples[j % comp.examples.length] || comp.type,
      estimatedPosition: `Section ${Math.floor(j / 2) + 1}`,
    })),
  );

  return {
    analysis,
    blueprint: { nodes },
  };
}
