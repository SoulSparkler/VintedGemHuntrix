import ManualScanForm from "@/components/ManualScanForm";
import { ScanResultCard } from "@/components/ScanResultCard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ManualScan } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function ManualScan() {
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  const { data: scans = [] } = useQuery<ManualScan[]>({
    queryKey: ["/api/manual-scans"],
  });

  const scanMutation = useMutation({
    mutationFn: (url: string) => apiRequest("POST", "/api/analyze-listing", { url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manual-scans"] });
      toast({ title: "Analysis complete!" });
      setIsScanning(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Analysis failed", 
        description: error.message,
        variant: "destructive"
      });
      setIsScanning(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/manual-scans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manual-scans"] });
      toast({ title: "Scan deleted" });
    },
  });

  const handleScan = (url: string) => {
    setIsScanning(true);
    scanMutation.mutate(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-manual-scan">Manual Scan</h1>
        <p className="text-muted-foreground mt-1">
          Analyze any Vinted listing instantly with AI vision
        </p>
      </div>

      <ManualScanForm onScan={handleScan} isScanning={isScanning} />

      <Card className="bg-muted/50 border-chart-2/20">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-chart-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">How Manual Scan Works</p>
              <p className="text-muted-foreground">
                Paste any Vinted listing URL to get immediate AI analysis. Results are saved separately from automated scans and won't trigger Telegram alerts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Scan History</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {scans.map((scan) => (
            <ScanResultCard
              key={scan.id}
              finding={scan}
              onDelete={() => deleteMutation.mutate(scan.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
