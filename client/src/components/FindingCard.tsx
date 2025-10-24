import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Trash2 } from "lucide-react";
import MaterialBadge from "./MaterialBadge";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FindingCardProps {
  listingTitle: string;
  listingUrl: string;
  price: string;
  confidenceScore: number;
  detectedMaterials: string[];
  aiReasoning: string;
  foundAt: Date;
  thumbnailUrl?: string;
  onDelete: () => void;
}

export default function FindingCard({
  listingTitle,
  listingUrl,
  price,
  confidenceScore,
  detectedMaterials,
  aiReasoning,
  foundAt,
  thumbnailUrl,
  onDelete
}: FindingCardProps) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex gap-4">
          {thumbnailUrl && (
            <div className="w-20 h-20 rounded-md bg-muted flex-shrink-0 overflow-hidden">
              <img 
                src={thumbnailUrl} 
                alt={listingTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-2" data-testid="text-listing-title">
              {listingTitle}
            </h3>
            <p className="text-sm font-semibold text-primary mt-1" data-testid="text-price">
              {price}
            </p>
            <p className="text-xs text-muted-foreground mt-1" data-testid="text-found-at">
              Found {formatDistanceToNow(foundAt, { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Confidence Score</p>
          <div className="flex items-center gap-3">
            <Progress value={confidenceScore} className="h-2" />
            <span className="font-mono text-sm font-medium min-w-[3rem] text-right">
              {confidenceScore}%
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2">Detected Materials</p>
          <div className="flex flex-wrap gap-2">
            {detectedMaterials.map((material, idx) => (
              <MaterialBadge key={idx} material={material} />
            ))}
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>
              <span className="text-xs font-medium">AI Reasoning</span>
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground" data-testid="text-reasoning">
                {aiReasoning}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-2"
            onClick={() => window.open(listingUrl, '_blank')}
            data-testid="button-view-listing"
          >
            <ExternalLink className="w-4 h-4" />
            View Listing
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            data-testid="button-delete-finding"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
