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

const schema = {
  name: "JewelryAssessment",
  schema: {
    type: "object",
    properties: {
      listingUrl:   { type: "string" },
      isGoldLikely: { type: "boolean" },
      confidence:   { type: "number", minimum: 0, maximum: 1 },
      reasons:      { type: "array", items: { type: "string" } }
    },
    required: ["listingUrl","isGoldLikely","confidence","reasons"],
    additionalProperties: false
  },
  strict: true
};

export async function analyzeJewelryImages(
  imageUrls: string[],
  listingTitle: string
): Promise<any> {
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
    const resp = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: "Return only valid JSON matching the schema." },
        { role: "user", content: [
          { type: "text", text:
            `Assess for real gold.
             URL: ${listingTitle}
             Title: ${listingTitle}
             Desc: ""` },
          ...imageUrls.slice(0,4).map(u => ({ type: "input_image", image_url: u }))
        ] }
      ],
      response_format: { type: "json_schema", json_schema: schema },
      max_output_tokens: 300
    });

    const json = JSON.parse(resp.output[0].content[0].text);
    return {
        confidenceScore: json.confidence * 100,
        isValuable: json.isGoldLikely,
        detectedMaterials: [],
        reasoning: json.reasons.join(", "),
        specificFindings: [],
    }
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
