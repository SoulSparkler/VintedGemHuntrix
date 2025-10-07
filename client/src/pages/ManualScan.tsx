import ManualScanForm from "@/components/ManualScanForm";
import FindingCard from "@/components/FindingCard";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ManualScan() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = (url: string) => {
    console.log('Scanning URL:', url);
    setIsScanning(true);
    // TODO: remove mock functionality
    setTimeout(() => setIsScanning(false), 2000);
  };

  // TODO: remove mock functionality
  const mockScanHistory = [
    {
      id: "1",
      listingTitle: "Gold Chain Bracelet - Tested Piece",
      listingUrl: "https://www.vinted.com/items/99999",
      price: "€35.00",
      confidenceScore: 95,
      detectedMaterials: ["18K Gold"],
      aiReasoning: "Clear 750 hallmark visible on clasp. Characteristic gold color and weight appearance. Professional jewelry craftsmanship with secure clasp mechanism.",
      foundAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
    {
      id: "2",
      listingTitle: "Costume Jewellery Set",
      listingUrl: "https://www.vinted.com/items/88888",
      price: "€5.00",
      confidenceScore: 15,
      detectedMaterials: [],
      aiReasoning: "No hallmarks visible. Material appears to be base metal with plating. Lightweight construction typical of costume jewelry. No precious materials detected.",
      foundAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ];

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
          {mockScanHistory.map((scan) => (
            <FindingCard
              key={scan.id}
              {...scan}
              onDelete={() => console.log('Delete scan', scan.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
