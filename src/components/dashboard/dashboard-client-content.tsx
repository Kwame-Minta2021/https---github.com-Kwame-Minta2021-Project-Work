
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
import { MOCK_HISTORICAL_DATA as ALL_MOCK_HISTORICAL_DATA } from '@/lib/constants';
import { subscribeToRealtimeData } from '@/lib/firebase-data';
import type { HistoricalDataPoint, CustomAlertSettings, AirQualityData } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';


interface DashboardClientContentProps {
  children: React.ReactNode;
  lng: string;
  initialCustomAlertSettings: CustomAlertSettings;
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
  const [realtimeData, setRealtimeData] = React.useState<AirQualityData | null>(null);
  const [historicalReadings, setHistoricalReadings] = React.useState<HistoricalDataPoint[]>([]);

  useEffect(() => {
    console.log("DashboardClientContent: Setting up Firebase real-time data subscription with 2-minute intervals");
    
    // Function to fetch and update data
    const fetchData = () => {
      const unsubscribe = subscribeToRealtimeData((data) => {
        if (data) {
          setRealtimeData(data);
          console.log("DashboardClientContent: Received real-time data:", data);
          
          // Add real-time data to historical readings
          const newHistoricalPoint: HistoricalDataPoint = {
            timestamp: data.timestamp.toISOString(),
            CO: data.co.value,
            VOCs: data.vocs.value,
            PM25: data.pm2_5.value,
            PM10: data.pm1_0.value,
            PM100: data.pm10.value,
            CH4LPG: data.ch4Lpg.value
          };
          
          setHistoricalReadings(prev => {
            const updated = [...prev, newHistoricalPoint];
            // Keep only last 1000 readings to prevent memory issues
            return updated.slice(-1000);
          });
          
          // Check alerts with real-time data
          if (initialCustomAlertSettings && t && toast) {
            checkAlertsAndNotify(lng, initialCustomAlertSettings, data, t, toast);
          }
        } else {
          console.warn("DashboardClientContent: No real-time data received");
        }
      });
      
      // Unsubscribe after getting one update
      setTimeout(() => {
        unsubscribe();
      }, 5000); // Give 5 seconds to get the data
    };

    // Initial fetch
    fetchData();
    
    // Set up 2-minute interval
    const interval = setInterval(() => {
      console.log("DashboardClientContent: Fetching data (2-minute interval)");
      fetchData();
    }, 2 * 60 * 1000); // 2 minutes

    return () => {
      console.log("DashboardClientContent: Cleaning up Firebase subscription and interval");
      clearInterval(interval);
    };
  }, [initialCustomAlertSettings, lng, t, toast]);


  React.useEffect(() => {
    let newFilteredData: HistoricalDataPoint[] = [];
    
    // Use real historical readings if available, otherwise fall back to mock data
    const dataSource = historicalReadings.length > 0 ? historicalReadings : ALL_MOCK_HISTORICAL_DATA;
    
    if (date?.from && date?.to) {
      const startDate = startOfDay(date.from);
      const endDate = endOfDay(date.to);
      newFilteredData = dataSource.filter(point => {
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
       newFilteredData = dataSource.filter(point => {
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
  }, [date, historicalReadings]);

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

      {realtimeData ? (
        <RealtimeDataGrid data={realtimeData} />
      ) : (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight mb-4">{t('realTimeAirQuality')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-3 w-8" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      <DataVisualization historicalData={filteredHistoricalData} />
      <Suspense fallback={<div>Loading AI Analyzer...</div>}>
        {children}
      </Suspense>
      {/* Hidden div for PDF rendering source is removed */}
    </div>
  );
}
