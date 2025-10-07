import { Button } from "@/components/ui/button";
import SearchQueryCard from "@/components/SearchQueryCard";
import AddSearchDialog from "@/components/AddSearchDialog";
import { Plus, Search as SearchIcon } from "lucide-react";
import { useState } from "react";

export default function SearchQueries() {
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
    {
      id: "3",
      searchLabel: "Pearl Necklace Bundle",
      vintedUrl: "https://www.vinted.com/catalog?search_text=pearl+necklace+bundle",
      scanFrequency: 12,
      confidenceThreshold: 75,
      isActive: true,
      lastScannedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: "scanning" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="heading-searches">Search Queries</h1>
          <p className="text-muted-foreground mt-1">
            Manage your monitored Vinted searches
          </p>
        </div>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gap-2"
          data-testid="button-add-search"
        >
          <Plus className="w-4 h-4" />
          Add Search
        </Button>
      </div>

      {mockSearches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <SearchIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No search queries yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            Add your first Vinted search URL to start monitoring for valuable jewelry listings
          </p>
          <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Your First Search
          </Button>
        </div>
      )}

      <AddSearchDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={(data) => console.log('New search:', data)}
      />
    </div>
  );
}
