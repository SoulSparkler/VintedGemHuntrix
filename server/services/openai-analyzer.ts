import OpenAI from "openai";

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("OpenAI client initialized successfully.");
} else {
  console.warn(
    "OPENAI_API_KEY is not set. Image analysis will be disabled."
  );
}

interface AnalysisResult {
  confidenceScore: number;
  isValuable: boolean;
  detectedMaterials: string[];
  reasoning: string;
}

const schema = {
  name: "JewelryAssessment",
  schema: {
    type: "object",
    properties: {
      listingUrl: { type: "string" },
      isGoldLikely: { type: "boolean" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
      reasons: { type: "array", items: { type: "string" } }
    },
    required: ["listingUrl", "isGoldLikely", "confidence", "reasons"],
    additionalProperties: false
  },
  strict: true
};

function safeParseJSON(s: string): { ok: boolean; value?: any; error?: string; raw?: string } {
  try { return { ok: true, value: JSON.parse(s) }; }
  catch {
    const m = s.match(/\{[\s\S]*\}$/);
    if (m) { try { return { ok: true, value: JSON.parse(m[0]) }; } catch { } }
    return { ok: false, error: "Invalid JSON", raw: s };
  }
}

export async function analyzeJewelryImages(
  imageUrls: string[],
  listingTitle: string,
  listingUrl: string
): Promise<AnalysisResult> {
  if (!openai) {
    return {
      confidenceScore: 0,
      isValuable: false,
      detectedMaterials: [],
      reasoning: "Image analysis is disabled because OPENAI_API_KEY is not configured.",
    };
  }

  console.log(`Analyzing ${imageUrls.length} images with OpenAI Vision`);

  if (imageUrls.length === 0) {
    return {
      confidenceScore: 0,
      isValuable: false,
      detectedMaterials: [],
      reasoning: "No images available for analysis",
    };
  }

  try {
    const resp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "Return only valid JSON that matches the schema." },
            {
                role: "user", content: [
                    { type: "text", text: `Assess for real gold.\nURL: ${listingUrl}\nTitle: ${listingTitle}` },
                    ...imageUrls.slice(0, 4).map(u => ({ type: "image_url", image_url: { url: u } }))
                ]
            }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300
    });

    const content = resp.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsed = safeParseJSON(content);
    if (!parsed.ok) {
      throw new Error("Could not parse JSON from response");
    }

    const result = parsed.value;

    return {
      confidenceScore: result.confidence * 100,
      isValuable: result.isGoldLikely,
      detectedMaterials: [], // The new schema does not include this field
      reasoning: result.reasons.join("\n"),
    };
  } catch (error: any) {
    console.error("Error analyzing with OpenAI:", error.message);
    return {
      confidenceScore: 0,
      isValuable: false,
      detectedMaterials: [],
      reasoning: `Analysis failed: ${error.message}`,
    };
  }
}
