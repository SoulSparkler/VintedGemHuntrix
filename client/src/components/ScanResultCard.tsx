import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function ScanResultCard({ finding, onDelete }) {
  const getRecommendationClass = (recommendation) => {
    if (recommendation?.startsWith("✅")) return "bg-green-600";
    if (recommendation?.startsWith("🤔")) return "bg-yellow-600";
    if (recommendation?.startsWith("❌")) return "bg-red-600";
    return "bg-gray-600";
  };

  return (
    <Card className="p-4 bg-neutral-900 text-neutral-100 shadow-lg border border-neutral-700">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">{finding.listingTitle}</h2>
        {finding.buyRecommendation && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationClass(
              finding.buyRecommendation
            )}`}
          >
            {finding.buyRecommendation}
          </span>
        )}
      </div>

      <p className="text-sm mt-1 opacity-80">Found {finding.foundAgo}</p>

      <div className="mt-3">
        <div className="flex justify-between text-sm">
          <span>Confidence Score</span>
          <span>{finding.confidenceScore}%</span>
        </div>
        <Progress value={finding.confidenceScore} className="h-2 mt-1" />
      </div>

      {finding.hallmarkPurity && (
        <div className="mt-2 text-sm text-cyan-300 bg-cyan-900/50 px-2 py-1 rounded-md">
          <strong>Hallmark Detected:</strong> {finding.hallmarkPurity}
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

      <Accordion type="single" collapsible defaultValue="item-1" className="w-full mt-2">
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-semibold text-sm pt-2 pb-1">
            AI Reasoning
          </AccordionTrigger>
          <AccordionContent className="text-gray-200 text-sm whitespace-pre-wrap pt-2">
            {finding.aiReasoning}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-4 text-sm border-t border-gray-700 pt-4">
        <p>
          <span className="opacity-70">Item price:</span> €{finding.price?.toFixed(2) || "N/A"}
        </p>
        <p>
          <span className="opacity-70">Shipping:</span> €4.00
        </p>
        <p className="font-semibold">
          Total: €{((finding.price || 0) + 4).toFixed(2)}
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
