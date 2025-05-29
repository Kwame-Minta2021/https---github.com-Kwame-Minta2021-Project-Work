
// src/components/dashboard/dashboard-client-content.tsx
'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays, format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // Import useTranslation

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RealtimeDataGrid from '@/components/dashboard/realtime-data-grid';
import DataVisualization from '@/components/dashboard/data-visualization';
import PrintableReport from '@/components/dashboard/printable-report';
import { MOCK_AIR_QUALITY_DATA, MOCK_HISTORICAL_DATA as ALL_MOCK_HISTORICAL_DATA } from '@/lib/constants';
import type { HistoricalDataPoint } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import type { PrintHandler } from '@/app/[lng]/dashboard/layout'; // Adjusted path
import { cn } from '@/lib/utils';

interface DashboardClientContentProps {
  setPrintHandler?: (handler: PrintHandler) => void;
  aiAnalysisForReport: AnalyzeAirQualityOutput | null;
  children: React.ReactNode; // For AIAnalyzerSection
  lng: string;
  // t: (key: string) => string; // Remove t from props
}

function AIAnalyzerSkeleton({ t }: { t: (key: string) => string }) {
  return (
    <section id="analyzer-skeleton" className="mb-8 scroll-mt-20">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{t('aiAnalyzer')}</h2>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('rlModelAnalysis')}</CardTitle>
          <CardDescription>
            {t('rlModelAnalysisDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-2">{t('effectOnHumanHealth')}</h3>
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <hr className="my-4" />
          <div>
            <h3 className="font-semibold text-lg mb-2">{t('bestActionToReducePresence')}</h3>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

export default function DashboardClientContent({ 
  setPrintHandler, 
  aiAnalysisForReport,
  children,
  lng, // Receive lng
  // t // t is no longer received as a prop
}: DashboardClientContentProps) {
  const { t } = useTranslation(); // Get t function using the hook
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 6)), 
    to: endOfDay(new Date()),
  });

  const [filteredHistoricalData, setFilteredHistoricalData] = React.useState<HistoricalDataPoint[]>([]);

  React.useEffect(() => {
    let newFilteredData: HistoricalDataPoint[] = [];
    if (date?.from && date?.to) {
      const startDate = startOfDay(date.from);
      const endDate = endOfDay(date.to);
      newFilteredData = ALL_MOCK_HISTORICAL_DATA.filter(point => {
        try {
          const pointDate = parseISO(point.timestamp);
          return isWithinInterval(pointDate, { start: startDate, end: endDate });
        } catch (e) {
          return false;
        }
      });
    } else {
      const defaultStartDate = startOfDay(subDays(new Date(), 6));
      const defaultEndDate = endOfDay(new Date());
       newFilteredData = ALL_MOCK_HISTORICAL_DATA.filter(point => {
        try {
          const pointDate = parseISO(point.timestamp);
          return isWithinInterval(pointDate, { start: defaultStartDate, end: defaultEndDate });
        } catch (e) {
          return false;
        }
      });
    }
    setFilteredHistoricalData(newFilteredData);
  }, [date]);

  React.useEffect(() => {
    if (typeof setPrintHandler === 'function') {
      const handlePrintRequest = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          const reportElement = document.getElementById('printable-report-content-client');
          if (!reportElement) {
            console.error('Printable report content element not found.');
            if (printWindow) printWindow.close();
            return;
          }
          const originalDisplay = reportElement.style.display;
          reportElement.style.display = 'block';
          printWindow.document.write('<html><head><title>BreatheEasy Report</title>');
          printWindow.document.write('<style>body { font-family: sans-serif; margin: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } h1,h2,h3 { color: #64B5F6; } .whitespace-pre-line { white-space: pre-line; } </style>');
          printWindow.document.write('</head><body>');
          printWindow.document.write(reportElement.innerHTML);
          printWindow.onafterprint = () => {
            reportElement.style.display = originalDisplay;
            if (printWindow) printWindow.close(); 
          };
          printWindow.document.write('</body></html>');
          printWindow.document.close();
          printWindow.print();
        }
      };
      setPrintHandler(handlePrintRequest);
    }
  }, [setPrintHandler, aiAnalysisForReport]);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[260px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>{t('pickDateRange')}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              disabled={(d) => d > new Date() || d < subDays(new Date(), 60)}
            />
          </PopoverContent>
        </Popover>
      </div>

      <RealtimeDataGrid data={MOCK_AIR_QUALITY_DATA} />
      <DataVisualization historicalData={filteredHistoricalData} />
      <Suspense fallback={<AIAnalyzerSkeleton t={t} />}>
        {children}
      </Suspense>
      
      <div id="printable-report-content-client" style={{ display: 'none' }}>
        <PrintableReport airQualityData={MOCK_AIR_QUALITY_DATA} aiAnalysis={aiAnalysisForReport} lng={lng} />
      </div>
    </div>
  );
}
