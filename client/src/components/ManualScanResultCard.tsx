import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

export function ManualScanResultCard({ scan, onDelete }) {
  const confidencePercentage = (scan.confidence * 100).toFixed(0);

  return (
    <Card className="p-4 bg-neutral-900 text-neutral-100 shadow-lg border border-neutral-700">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{scan.isGoldLikely ? "Waarschijnlijk echt goud" : "Waarschijnlijk verguld"}</h2>
      </div>

      <div className="mt-3">
        <div className="flex justify-between text-sm">
          <span>Confidence Score</span>
          <span>{confidencePercentage}%</span>
        </div>
        <Progress value={confidencePercentage} className="h-2 mt-1" />
      </div>

      <div className="mt-4 border-t border-gray-700 pt-3">
        <p className="font-semibold text-sm mb-1">AI Reasoning</p>
        <ul className="list-disc list-inside text-gray-200 text-sm space-y-1">
          {scan.reasons?.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href={scan.listingUrl}
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
