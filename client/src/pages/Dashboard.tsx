import { Button } from "@/components/ui/button";
import SearchQueryCard from "@/components/SearchQueryCard";
import FindingCard from "@/components/FindingCard";
import AddSearchDialog from "@/components/AddSearchDialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SearchQuery, Finding } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SearchQuery | null>(null);
  const { toast } = useToast();

  const { data: searches = [] } = useQuery<SearchQuery[]>({
    queryKey: ["/api/searches"],
  });

  const { data: findings = [] } = useQuery<Finding[]>({
    queryKey: ["/api/findings"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/searches/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/searches"] });
      toast({ title: "Search deleted successfully" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SearchQuery> }) =>
      apiRequest("PUT", `/api/searches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/searches"] });
      toast({ title: "Search updated successfully" });
    },
  });

  const triggerMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/searches/${id}/trigger`),
    onSuccess: () => {
      toast({ title: "Scan started", description: "Check findings in a few moments" });
    },
  });

  const deleteFindingMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/findings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/findings"] });
      toast({ title: "Finding deleted" });
    },
  });

  const createSearchMutation = useMutation({
    mutationFn: (data: { url: string; frequency: number; threshold: number }) => {
      const label = new URL(data.url).searchParams.get("search_text") || "Custom Search";
      return apiRequest("POST", "/api/searches", {
        vintedUrl: data.url,
        searchLabel: label,
        scanFrequencyHours: data.frequency,
        confidenceThreshold: data.threshold,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/searches"] });
      toast({ title: "Search query added successfully" });
    },
  });

  const handleOpenAddDialog = () => {
    setEditingSearch(null);
    setDialogOpen(true);
  };

  const handleOpenEditDialog = (search: SearchQuery) => {
    setEditingSearch(search);
    setDialogOpen(true);
  };

  const handleDialogSubmit = (data: { url: string; frequency: number; threshold: number }) => {
    const label = new URL(data.url).searchParams.get("search_text") || "Custom Search";

    if (editingSearch) {
      updateMutation.mutate({
        id: editingSearch.id,
        data: {
          vintedUrl: data.url,
          searchLabel: label,
          scanFrequencyHours: data.frequency,
          confidenceThreshold: data.threshold,
        },
      });
    } else {
      createSearchMutation.mutate(data);
    }
  };

  const getStatus = (search: SearchQuery): "active" | "paused" | "scanning" => {
    if (!search.isActive) return "paused";
    return "active";
  };

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
              onClick={handleOpenAddDialog}
              size="sm"
              className="gap-2"
              data-testid="button-add-search"
            >
              <Plus className="w-4 h-4" />
              Add Search
            </Button>
          </div>

          <div className="space-y-4">
            {searches.slice(0, 2).map((search) => (
              <SearchQueryCard
                key={search.id}
                searchLabel={search.searchLabel}
                vintedUrl={search.vintedUrl}
                scanFrequency={search.scanFrequencyHours}
                confidenceThreshold={search.confidenceThreshold}
                isActive={search.isActive}
                lastScannedAt={search.lastScannedAt}
                status={getStatus(search)}
                onToggle={() => updateMutation.mutate({ 
                  id: search.id, 
                  data: { isActive: !search.isActive } 
                })}
                onEdit={() => handleOpenEditDialog(search)}
                onDelete={() => deleteMutation.mutate(search.id)}
                onTrigger={() => triggerMutation.mutate(search.id)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Findings</h2>
          <div className="space-y-4">
            {findings.slice(0, 2).map((finding) => (
              <FindingCard
                key={finding.id}
                listingTitle={finding.listingTitle}
                listingUrl={finding.listingUrl}
                price={finding.price}
                confidenceScore={finding.confidenceScore}
                detectedMaterials={finding.detectedMaterials}
                aiReasoning={finding.aiReasoning}
                foundAt={finding.foundAt}
                onDelete={() => deleteFindingMutation.mutate(finding.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <AddSearchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleDialogSubmit}
        editData={editingSearch ? {
          url: editingSearch.vintedUrl,
          frequency: editingSearch.scanFrequencyHours,
          threshold: editingSearch.confidenceThreshold
        } : null}
      />
    </div>
  );
}
