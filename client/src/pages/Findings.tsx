import FindingCard from "@/components/FindingCard";
import { Gem } from "lucide-react";

export default function Findings() {
  // TODO: remove mock functionality
  const mockFindings = [
    {
      id: "1",
      listingTitle: "Vintage Pearl Necklace - Mystery Bundle",
      listingUrl: "https://www.vinted.com/items/12345",
      price: "€15.00",
      confidenceScore: 92,
      detectedMaterials: ["14K Gold", "Real Pearl"],
      aiReasoning: "Clear 585 hallmark visible on clasp in photo 2. Pearl shows natural luster and irregular surface texture consistent with genuine pearls. Professional craftsmanship evident in setting.",
      foundAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "2",
      listingTitle: "Silver Bracelet Bundle Deal",
      listingUrl: "https://www.vinted.com/items/67890",
      price: "€8.50",
      confidenceScore: 87,
      detectedMaterials: ["925 Silver"],
      aiReasoning: "Sterling 925 stamp clearly visible on clasp in photo 1. Characteristic silver tarnish patterns indicate genuine material. Well-preserved condition.",
      foundAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    {
      id: "3",
      listingTitle: "Mixed Jewellery Lot - Various Pieces",
      listingUrl: "https://www.vinted.com/items/11122",
      price: "€22.00",
      confidenceScore: 84,
      detectedMaterials: ["18K Gold", "Diamond"],
      aiReasoning: "750 hallmark detected on ring band. Small diamond shows clear faceting and proper setting. Ring appears to be vintage estate piece.",
      foundAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-findings">Findings History</h1>
        <p className="text-muted-foreground mt-1">
          All valuable items discovered with 80%+ confidence
        </p>
      </div>

      {mockFindings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mockFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              {...finding}
              onDelete={() => console.log('Delete finding', finding.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Gem className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No findings yet</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Once the AI detects valuable jewelry in your monitored searches, they'll appear here
          </p>
        </div>
      )}
    </div>
  );
}
