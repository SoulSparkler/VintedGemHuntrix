import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { hallmarkToPurity } from "@/utils/hallmarkToPurity";
import { timeAgo } from "@/utils/timeAgo";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import type { Finding, ManualScan } from "@shared/schema";

type ScanResultCardProps = {
  finding: Finding | ManualScan;
  onDelete: () => void;
};

export function ScanResultCard({ finding, onDelete }: ScanResultCardProps) {
  const hallmarkInfo = hallmarkToPurity(finding.aiReasoning);
  const numericPrice = Number(finding.price);
  const totalCost = (numericPrice || 0) + 4;
  const advice =
    finding.confidenceScore >= 80 && totalCost <= 20
      ? "BUY"
      : finding.confidenceScore >= 60
      ? "MAYBE"
      : "SKIP";

  const timeText = "foundAgo" in finding ? `Found ${finding.foundAgo}` : `Scanned ${timeAgo(finding.scannedAt)}`;

  return (
    <Card className="p-4 bg-neutral-900 text-neutral-100 shadow-lg border border-neutral-700">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{finding.listingTitle}</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            advice === "BUY"
              ? "bg-green-600"
              : advice === "MAYBE"
              ? "bg-yellow-600"
              : "bg-red-600"
          }`}
        >
          {advice}
        </span>
      </div>

      <p className="text-sm mt-1 opacity-80">{timeText}</p>

      <div className="mt-3">
        <div className="flex justify-between text-sm">
          <span>Confidence Score</span>
          <span>{finding.confidenceScore}%</span>
        </div>
        <Progress value={finding.confidenceScore} className="h-2 mt-1" />
      </div>

      {hallmarkInfo && (
        <div className="mt-2 text-sm text-gray-300">
          Hallmark {hallmarkInfo.karat} → {hallmarkInfo.percentage}% {hallmarkInfo.metal}
        </div>
      )}

      <div className="mt-3">
        <p className="text-sm font-medium mb-1">Detected Materials</p>
        <div className="flex gap-2 flex-wrap">
          {finding.detectedMaterials.map((m: string) => (
            <span key={m} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
              {m}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 border-t border-gray-700 pt-3">
        <p className="font-semibold text-sm mb-1">AI Reasoning</p>
        <p className="text-gray-200 text-sm whitespace-pre-wrap">
          {finding.aiReasoning}
        </p>
      </div>

      <div className="mt-4 text-sm">
        <p>
          <span className="opacity-70">Item price:</span> €{numericPrice ? numericPrice.toFixed(2) : "N/A"}
        </p>
        <p>
          <span className="opacity-70">Shipping:</span> €4.00
        </p>
        <p className="font-semibold">
          Total: €{totalCost.toFixed(2)}
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={finding.listingUrl}
          target="_blank"
          className="flex-1 bg-green-600 hover:bg-green-700 text-center py-2 rounded-lg text-white"
        >
          View Listing
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          data-testid="button-delete-finding"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
