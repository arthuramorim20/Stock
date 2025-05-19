
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({
  title,
  value,
  description,
  icon,
  className,
  trend,
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend && (
              <span 
                className={cn(
                  trend.isPositive ? "text-inventory-high" : "text-inventory-low"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
            )}
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
