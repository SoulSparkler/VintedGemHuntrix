import { Button } from "@/components/ui/button";
import SearchQueryCard from "@/components/SearchQueryCard";
import FindingCard from "@/components/FindingCard";
import AddSearchDialog from "@/components/AddSearchDialog";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // TODO: remove mock functionality
  const mockSearches = [
    {
      id: "1",
      searchLabel: "Mystery Jewellery Silver",
      vintedUrl: "https://www.vinted.com/catalog?search_text=mystery+jewellery+silver",
      scanFrequency: 3,
      confidenceThreshold: 80,
      isActive: true,
      lastScannedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "active" as const,
    },
    {
      id: "2",
      searchLabel: "Vintage Gold Jewellery",
      vintedUrl: "https://www.vinted.com/catalog?search_text=vintage+gold+jewellery",
      scanFrequency: 6,
      confidenceThreshold: 85,
      isActive: false,
      lastScannedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: "paused" as const,
    },
  ];

  const mockFindings = [
    {
      id: "1",
      listingTitle: "Vintage Pearl Necklace - Mystery Bundle",
      listingUrl: "https://www.vinted.com/items/12345",
      price: "€15.00",
      confidenceScore: 92,
      detectedMaterials: ["14K Gold", "Real Pearl"],
      aiReasoning: "Clear 585 hallmark visible on clasp in photo 2. Pearl shows natural luster and irregular surface texture consistent with genuine pearls.",
      foundAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: "2",
      listingTitle: "Silver Bracelet Bundle Deal",
      listingUrl: "https://www.vinted.com/items/67890",
      price: "€8.50",
      confidenceScore: 87,
      detectedMaterials: ["925 Silver"],
      aiReasoning: "Sterling 925 stamp clearly visible on clasp. Characteristic silver tarnish patterns indicate genuine material.",
      foundAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-dashboard">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Monitor your searches and discover valuable finds
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Searches</h2>
            <Button
              onClick={() => setAddDialogOpen(true)}
              size="sm"
              className="gap-2"
              data-testid="button-add-search"
            >
              <Plus className="w-4 h-4" />
              Add Search
            </Button>
          </div>

          <div className="space-y-4">
            {mockSearches.map((search) => (
              <SearchQueryCard
                key={search.id}
                {...search}
                onToggle={() => console.log('Toggle', search.id)}
                onEdit={() => console.log('Edit', search.id)}
                onDelete={() => console.log('Delete', search.id)}
                onTrigger={() => console.log('Trigger', search.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Findings</h2>
          <div className="space-y-4">
            {mockFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                {...finding}
                onDelete={() => console.log('Delete finding', finding.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <AddSearchDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={(data) => console.log('New search:', data)}
      />
    </div>
  );
}
