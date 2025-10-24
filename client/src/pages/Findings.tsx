import { ScanResultCard } from "@/components/ScanResultCard";
import { Gem } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Finding } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function Findings() {
  const { toast } = useToast();

  const { data: findings = [], isLoading } = useQuery<Finding[]>({
    queryKey: ["/api/findings"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/findings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/findings"] });
      toast({ title: "Finding deleted" });
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-findings">Findings History</h1>
        <p className="text-muted-foreground mt-1">
          All valuable items discovered with 80%+ confidence
        </p>
      </div>

      {findings.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {findings.map((finding) => (
            <ScanResultCard
              key={finding.id}
              finding={finding}
              onDelete={() => deleteMutation.mutate(finding.id)}
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
