
import type { SensorReading } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface RealtimeDataCardProps {
  reading: SensorReading;
}

export default function RealtimeDataCard({ reading }: RealtimeDataCardProps) {
  const IconComponent = reading.icon;

  const getValueColorClass = () => {
    if (!reading.thresholds) {
      return reading.color ? '' : 'text-foreground'; // Default if no thresholds or base color
    }
    if (reading.value >= reading.thresholds.unhealthy) {
      return 'text-red-500 dark:text-red-400'; // Unhealthy
    }
    if (reading.value >= reading.thresholds.moderate) {
      return 'text-amber-500 dark:text-amber-400'; // Moderate
    }
    return reading.color ? '' : 'text-foreground'; // Good or if base color should be used
  };

  const valueStyle = reading.color && !getValueColorClass() ? { color: reading.color } : {};

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {reading.name}
        </CardTitle>
        {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" style={{color: reading.color}} />}
      </CardHeader>
      <CardContent>
        <div 
          className={cn("text-3xl font-bold", getValueColorClass())}
          style={valueStyle}
        >
          {reading.value.toFixed(2)}
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          {reading.unit}
        </p>
        {reading.description && (
          <CardDescription className="mt-2 text-xs">
            {reading.description}
          </CardDescription>
        )}
      </CardContent>
    </Card>
  );
}
