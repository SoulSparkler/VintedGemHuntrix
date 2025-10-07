import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit2, Trash2, Play } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { formatDistanceToNow } from "date-fns";

interface SearchQueryCardProps {
  searchLabel: string;
  vintedUrl: string;
  scanFrequency: number;
  confidenceThreshold: number;
  isActive: boolean;
  lastScannedAt: Date | null;
  status: "active" | "paused" | "scanning";
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTrigger: () => void;
}

export default function SearchQueryCard({
  searchLabel,
  vintedUrl,
  scanFrequency,
  confidenceThreshold,
  isActive,
  lastScannedAt,
  status,
  onToggle,
  onEdit,
  onDelete,
  onTrigger
}: SearchQueryCardProps) {
  return (
    <Card className="hover-elevate">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" data-testid="text-search-label">
              {searchLabel}
            </h3>
            <p className="text-xs text-muted-foreground truncate mt-1 font-mono" data-testid="text-url">
              {vintedUrl}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Scan Frequency</p>
            <p className="font-medium" data-testid="text-frequency">{scanFrequency}h</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Confidence Min</p>
            <p className="font-medium font-mono" data-testid="text-threshold">{confidenceThreshold}%</p>
          </div>
        </div>

        {lastScannedAt && (
          <p className="text-xs text-muted-foreground" data-testid="text-last-scanned">
            Last scanned {formatDistanceToNow(lastScannedAt, { addSuffix: true })}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t gap-2">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isActive}
              onCheckedChange={onToggle}
              data-testid="switch-active"
            />
            <span className="text-sm">{isActive ? 'Enabled' : 'Disabled'}</span>
          </div>

          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={onTrigger}
              data-testid="button-trigger"
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onEdit}
              data-testid="button-edit"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={onDelete}
              data-testid="button-delete"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
