
// src/components/dashboard/dashboard-client-content.tsx
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { DateRange } from 'react-day-picker';
import { subDays, format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import RealtimeDataGrid from '@/components/dashboard/realtime-data-grid';
import DataVisualization from '@/components/dashboard/data-visualization';
import { MOCK_AIR_QUALITY_DATA, MOCK_HISTORICAL_DATA as ALL_MOCK_HISTORICAL_DATA } from '@/lib/constants';
import type { HistoricalDataPoint, CustomAlertSettings, AirQualityData } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


interface DashboardClientContentProps {
  children: React.ReactNode;
  lng: string;
  initialCustomAlertSettings: CustomAlertSettings;
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

const checkAlertsAndNotify = (
  lng: string,
  currentSettings: CustomAlertSettings,
  airData: AirQualityData,
  t: (key: string, options?: any) => string,
  toastFn: (options: any) => void
) => {
  console.log("DashboardClientContent: Checking custom alerts. Settings:", currentSettings, "AirData CO:", airData.co.value, "PM2.5:", airData.pm2_5.value);
  if (currentSettings.co?.enabled && airData.co.value > currentSettings.co.threshold) {
    toastFn({
      title: t('customThresholdAlertTitle'),
      description: t('customCOAlertDesc', {
        value: airData.co.value.toFixed(2),
        threshold: currentSettings.co.threshold.toFixed(2),
        unit: 'ppm'
      }),
      variant: 'warning',
    });
     console.log("DashboardClientContent: CO custom alert triggered.");
  }

  if (currentSettings.pm2_5?.enabled && airData.pm2_5.value > currentSettings.pm2_5.threshold) {
    toastFn({
      title: t('customThresholdAlertTitle'),
      description: t('customPM25AlertDesc', {
        value: airData.pm2_5.value.toFixed(0),
        threshold: currentSettings.pm2_5.threshold.toFixed(0),
        unit: 'µg/m³'
      }),
      variant: 'warning',
    });
    console.log("DashboardClientContent: PM2.5 custom alert triggered.");
  }
};


export default function DashboardClientContent({
  children,
  lng,
  initialCustomAlertSettings,
}: DashboardClientContentProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 6)),
    to: endOfDay(new Date()),
  });

  const [filteredHistoricalData, setFilteredHistoricalData] = React.useState<HistoricalDataPoint[]>([]);

  useEffect(() => {
    console.log("DashboardClientContent: Initial load effect triggered. initialCustomAlertSettings:", initialCustomAlertSettings);
    if (initialCustomAlertSettings && MOCK_AIR_QUALITY_DATA && t && toast) {
        checkAlertsAndNotify(lng, initialCustomAlertSettings, MOCK_AIR_QUALITY_DATA, t, toast);
    }
    // This toast was for AI analysis for PDF report, which is removed.
    // A toast for AI Analyzer section loading is handled within AIAnalyzerSection itself or its parent.
    // if(aiAnalysisForReport && toast && t) {
    //     toast({ title: t('aiAnalysisUpdatedTitle'), description: t('aiAnalysisUpdatedDesc') });
    // }
  }, [initialCustomAlertSettings, lng, t, toast]);


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
          console.warn("DashboardClientContent: Error parsing historical data timestamp", point.timestamp, e);
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
          console.warn("DashboardClientContent: Error parsing historical data timestamp (default range)", point.timestamp, e);
          return false;
        }
      });
    }
    setFilteredHistoricalData(newFilteredData);
  }, [date]);

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
      {/* Hidden div for PDF rendering source is removed */}
    </div>
  );
}
