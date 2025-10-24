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
  specificFindings: Array<{
    item: string;
    evidence: string;
  }>;
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

Provide:
- Confidence score (0-100%)
- List of detected valuable materials
- Specific reasoning with photo references
- Whether this appears to be a "hidden gem" the seller may not recognize

Format response as JSON:
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
  listingTitle: string
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

  try {
    // Correctly type the content parts for the user message
    const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
      { type: 'text', text: `${ANALYSIS_PROMPT}\n\nListing title: "${listingTitle}"` },
      // Map image URLs to the correct format for the API
      ...imageUrls.slice(0, 4).map(
        (url): OpenAI.Chat.Completions.ChatCompletionContentPartImage => ({
          type: 'image_url',
          image_url: { url, detail: 'high' },
        }),
      ),
    ];

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        {
          role: "system",
          content: "You are a JSON API that analyzes images of vintage listings. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: userContent,
        },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages,
      max_tokens: 1000,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content);

    return {
      confidenceScore: result.confidence_score || 0,
      isValuable: result.is_valuable || false,
      detectedMaterials: result.detected_materials || [],
      reasoning: result.reasoning || "Analysis completed",
      specificFindings: result.specific_findings || [],
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
