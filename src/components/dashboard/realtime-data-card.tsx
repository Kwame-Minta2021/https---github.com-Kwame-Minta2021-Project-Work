import type { SensorReading } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface RealtimeDataCardProps {
  reading: SensorReading;
}

export default function RealtimeDataCard({ reading }: RealtimeDataCardProps) {
  const IconComponent = reading.icon;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {reading.name}
        </CardTitle>
        {IconComponent && <IconComponent className="h-5 w-5 text-muted-foreground" style={{color: reading.color}} />}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold" style={{color: reading.color}}>
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
