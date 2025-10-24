import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface AnalysisResult {
  confidenceScore: number;
  isValuable: boolean;
  detectedMaterials: string[];
  reasoning: string;
  specificFindings: Array<{ item: string; evidence: string }>;
}

const ANALYSIS_PROMPT = `
You are a professional jewelry authenticator.
Analyze the provided images and determine if the jewelry contains genuine valuable materials.

Look for:
- Hallmarks: 10K, 14K, 18K, 22K, 24K, 417, 585, 750, 916, 999, 925, Sterling, PT, PLAT
- Material clues (gold, silver, pearls, gemstones)
- Craftsmanship quality
- Signs of authenticity or value

Return ONLY valid JSON — no explanations, no markdown, no intro text.

Example format:
{
  "confidence_score": 85,
  "is_valuable": true,
  "detected_materials": ["14K Gold", "Real Pearl"],
  "reasoning": "Clear 585 hallmark visible on clasp in photo 2. Pearl shows natural luster and irregular surface texture consistent with genuine pearls.",
  "specific_findings": [
    {"item": "14K Gold clasp", "evidence": "585 stamp visible in photo 2"},
    {"item": "Natural pearl", "evidence": "Irregular surface, orient luster in photo 1"}
  ]
}
`;

export async function analyzeJewelryImages(
  imageUrls: string[],
  listingTitle: string
): Promise<AnalysisResult> {
  console.log(`Analyzing ${imageUrls.length} images with OpenAI Vision`);

  if (imageUrls.length === 0) {
    return {
      confidenceScore: 0,
      isValuable: false,
      detectedMaterials: [],
      reasoning: "No images available for analysis",
      specificFindings: [],
    };
  }

  const messages: any[] = [
    {
      role: "user",
      content: [
        { type: "text", text: `${ANALYSIS_PROMPT}\n\nListing title: "${listingTitle}"` },
        ...imageUrls.slice(0, 4).map(url => ({
          type: "image_url",
          image_url: { url, detail: "high" },
        })),
      ],
    },
  ];

  const modelsToTry = ["gpt-4o", "gpt-4o-mini"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Attempting analysis with model: ${model}`);

      const response = await openai.chat.completions.create({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.2,
        response_format: { type: "json_object" }, // ✅ Force JSON-only
      });

      const result = response.choices[0]?.message?.content;
      if (!result) throw new Error("No response content received");

      const parsed = JSON.parse(result);

      console.log(`✅ Analysis succeeded with ${model}`);

      return {
        confidenceScore: parsed.confidence_score ?? 0,
        isValuable: parsed.is_valuable ?? false,
        detectedMaterials: parsed.detected_materials ?? [],
        reasoning: parsed.reasoning ?? "Analysis completed",
        specificFindings: parsed.specific_findings ?? [],
      };
    } catch (error: any) {
      console.error(`❌ Error analyzing with ${model}:`, error.message);
      lastError = error;
    }
  }

  // If both models fail:
  return {
    confidenceScore: 0,
    isValuable: false,
    detectedMaterials: [],
    reasoning: `Analysis failed: ${lastError?.message || "Unknown error"}`,
    specificFindings: [],
  };
}
