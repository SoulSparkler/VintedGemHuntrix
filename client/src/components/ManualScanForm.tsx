import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";

interface ManualScanFormProps {
  onScan: (url: string) => void;
  isScanning?: boolean;
}

export default function ManualScanForm({ onScan, isScanning = false }: ManualScanFormProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onScan(url.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Manual Listing Analysis</CardTitle>
        <p className="text-sm text-muted-foreground">
          Paste any Vinted listing URL for instant AI analysis
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listing-url">Vinted Listing URL</Label>
            <Input
              id="listing-url"
              type="url"
              placeholder="https://www.vinted.com/items/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isScanning}
              data-testid="input-listing-url"
            />
          </div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={!url.trim() || isScanning}
            data-testid="button-analyze"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze Now
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
