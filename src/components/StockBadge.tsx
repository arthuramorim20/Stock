
import { cn } from "@/lib/utils";

type StockLevel = "low" | "medium" | "high" | "out";

interface StockBadgeProps {
  level: StockLevel;
  className?: string;
}

const stockLabels = {
  low: "Low Stock",
  medium: "In Stock",
  high: "Well Stocked",
  out: "Out of Stock",
};

const StockBadge = ({ level, className }: StockBadgeProps) => {
  return (
    <span className={cn(
      "stock-badge",
      {
        "stock-low": level === "low" || level === "out",
        "stock-medium": level === "medium",
        "stock-high": level === "high",
      },
      className
    )}>
      {stockLabels[level]}
    </span>
  );
};

export default StockBadge;
