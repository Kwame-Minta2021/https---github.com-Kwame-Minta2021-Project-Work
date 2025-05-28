import type { AirQualityData } from '@/types';
import RealtimeDataCard from './realtime-data-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface RealtimeDataGridProps {
  data: AirQualityData;
}

export default function RealtimeDataGrid({ data }: RealtimeDataGridProps) {
  const readings = [data.co, data.vocs, data.ch4Lpg, data.pm1_0, data.pm2_5, data.pm10];

  return (
    <section id="realtime" className="mb-8 scroll-mt-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold tracking-tight">Real-time Air Quality</h2>
        <p className="text-sm text-muted-foreground">
          Last updated: {format(data.timestamp, "PPpp")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {readings.map((reading) => (
          <RealtimeDataCard key={reading.id} reading={reading} />
        ))}
      </div>
    </section>
  );
}
