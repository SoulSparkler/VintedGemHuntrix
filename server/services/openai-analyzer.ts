import OpenAI from "openai";

let openai: OpenAI | null = null;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("OpenAI client initialized successfully.");
} else {
  console.warn("OPENAI_API_KEY is not set. Image analysis will be disabled.");
}

interface SpecificFinding {
  item: string;
  evidence: string;
}

interface AnalysisResult {
  confidenceScore: number;
  isValuable: boolean;
  detectedMaterials: string[];
  reasoning: string;
  specificFindings: SpecificFinding[];
  hallmarkPurity?: string | null;
  buyRecommendation?: string;
}

function hallmarkToPurity(hallmark: string): string | null {
  const map: Record<string, string> = {
    "333": "8K (33.3% gold)",
    "375": "9K (37.5% gold)",
    "585": "14K (58.5% gold)",
    "750": "18K (75% gold)",
    "916": "22K (91.6% gold)",
    "999": "24K (99.9% gold)",
    "925": "Sterling Silver (92.5%)",
    "950": "Platinum (95%)",
  };
  return map[hallmark] || null;
}

const ANALYSIS_PROMPT = `Analyze this jewelry image and determine if it contains genuine valuable materials.

Look for:
1. HALLMARKS/STAMPS:
   - Gold: 10K, 14K, 18K, 22K, 24K, 417, 585, 750, 916, 999
   - Silver: 925, Sterling, 900, 800
   - Platinum: 950, 900, PT, PLAT

2. VISUAL CHARACTERISTICS:
   - Gold: Rich yellow/rose color, weight appearance, wear patterns
   - Silver: Bright metallic luster, tarnish patterns
   - Pearls: Natural luster, irregular shape, surface texture
   - Precious stones: Clarity, cut quality, color depth

3. CONTEXT CLUES:
   - Professional craftsmanship
   - Quality settings
   - Age indicators

If NO hallmark is visible, reason based on the visual appearance only.
Describe if the color, texture, and reflections *suggest* genuine materials.

Provide:
- Confidence score (0-100%)
- List of detected valuable materials
- Specific reasoning with photo references
- Whether this appears to be a "hidden gem"
- Always respond in JSON with fields:
{
  "confidence_score": 85,
  "is_valuable": true,
  "detected_materials": ["14K Gold", "Real Pearl"],
  "reasoning": "Clear 585 hallmark visible on clasp in photo 2. Pearl shows natural luster and irregular surface texture consistent with genuine pearls.",
  "specific_findings": [
    {"item": "14K Gold clasp", "evidence": "585 stamp visible in photo 2"},
    {"item": "Natural pearl", "evidence": "Irregular surface, orient luster in photo 1"}
  ]
}`;

export async function analyzeJewelryImages(
  imageUrls: string[],
  listingTitle: string,
  listingPrice?: number // optional, used for buy recommendation
): Promise<AnalysisResult> {
  if (!openai) {
    return {
      confidenceScore: 0,
      isValuable: false,
      detectedMaterials: [],
      reasoning: "Image analysis is disabled because OPENAI_API_KEY is not configured.",
      specificFindings: [],
    };
  }

  if (imageUrls.length === 0) {
    return {
      confidenceScore: 0,
      isValuable: false,
      detectedMaterials: [],
      reasoning: "No images available for analysis",
      specificFindings: [],
    };
  }

  console.log(`Analyzing ${imageUrls.length} images with OpenAI Vision`);

  try {
    const messages: any[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${ANALYSIS_PROMPT}\n\nListing title: "${listingTitle}"`,
          },
          ...imageUrls.slice(0, 4).map((url) => ({
            type: "image_url",
            image_url: { url, detail: "high" },
          })),
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not parse JSON from response");

    const result = JSON.parse(jsonMatch[0]);

    const hallmark = result.reasoning?.match(/\b(333|375|585|750|916|999|925|950)\b/)?.[0] || null;
    const hallmarkPurity = hallmark ? hallmarkToPurity(hallmark) : null;

    // ✨ Non-hallmark reasoning mode
    let reasoning = result.reasoning || "Analysis completed";
    if (!hallmark && reasoning && !reasoning.includes("hallmark")) {
      reasoning +=
        " No hallmark visible, but based on color, reflectivity, and texture, this item may contain genuine gold, silver, or natural pearls.";
    }

    // 🧮 Koopadvies (vaste €4 verzending)
    const totalCost = listingPrice ? listingPrice + 4 : null;
    let buyRecommendation: string | undefined = undefined;
    if (listingPrice != null) {
      if (result.is_valuable && result.confidence_score >= 75) {
        buyRecommendation = `✅ Worth buying — appears genuine. Total cost ≈ €${totalCost}`;
      } else if (result.confidence_score >= 50) {
        buyRecommendation = `🤔 Possible deal — looks promising but uncertain. Total ≈ €${totalCost}`;
      } else {
        buyRecommendation = `❌ Skip — low likelihood of valuable materials. Total ≈ €${totalCost}`;
      }
    }

    return {
      confidenceScore: result.confidence_score || 0,
      isValuable: result.is_valuable || false,
      detectedMaterials: result.detected_materials || [],
      reasoning,
      specificFindings: result.specific_findings || [],
      hallmarkPurity,
      buyRecommendation,
    };
  } catch (error: any) {
    console.error("Error analyzing with OpenAI:", error.message);
    return {
      confidenceScore: 0,
      isValuable: false,
      detectedMaterials: [],
      reasoning: `Analysis failed: ${error.message}`,
      specificFindings: [],
    };
  }
}
