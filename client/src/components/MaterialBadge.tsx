import { Badge } from "@/components/ui/badge";
import { Gem } from "lucide-react";

interface MaterialBadgeProps {
  material: string;
}

export default function MaterialBadge({ material }: MaterialBadgeProps) {
  return (
    <Badge variant="secondary" className="gap-1.5">
      <Gem className="w-3 h-3" />
      {material}
    </Badge>
  );
}
