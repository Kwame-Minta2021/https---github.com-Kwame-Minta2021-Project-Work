
// src/components/dashboard/dashboard-client-content.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Suspense } from 'react';
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
import PrintableReport from '@/components/dashboard/printable-report';
import { MOCK_AIR_QUALITY_DATA, MOCK_HISTORICAL_DATA as ALL_MOCK_HISTORICAL_DATA } from '@/lib/constants';
import type { HistoricalDataPoint, CustomAlertSettings, AirQualityData } from '@/types';
import type { AnalyzeAirQualityOutput } from '@/ai/flows/analyze-air-quality';
import type { SetPrintHandlerType } from '@/app/[lng]/dashboard/layout'; 
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { sendShortAlertSms, type SendShortAlertInput } from '@/ai/flows/send-short-alert-sms-flow';

interface DashboardClientContentProps {
  setPrintHandler?: SetPrintHandlerType; 
  aiAnalysisForReport: AnalyzeAirQualityOutput | null;
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

// Moved from page.tsx
const checkAlertsAndNotify = (
  lng: string, 
  currentSettings: CustomAlertSettings, 
  airData: AirQualityData,
  t: (key: string, options?: any) => string,
  toastFn: (options: any) => void 
) => {
  // Check custom CO threshold
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
  }

  // Check custom PM2.5 threshold
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
  }

  // Check for predefined unhealthy thresholds for SMS
  Object.values(airData).forEach(pollutant => {
    if (typeof pollutant === 'object' && pollutant.thresholds?.unhealthy && pollutant.value > pollutant.thresholds.unhealthy) {
      const smsInput: SendShortAlertInput = {
        pollutantName: pollutant.name.split(' ')[0], 
        currentValue: pollutant.value,
        thresholdValue: pollutant.thresholds.unhealthy,
        unit: pollutant.unit,
        language: lng,
      };
      sendShortAlertSms(smsInput)
        .then(result => {
          console.log(`SMS alert attempt for ${pollutant.name}: ${result.status}`);
        })
        .catch(error => {
          console.error(`Failed to send SMS alert for ${pollutant.name}:`, error);
        });
    }
  });
};


export default function DashboardClientContent({ 
  setPrintHandler, 
  aiAnalysisForReport,
  children,
  lng, 
  initialCustomAlertSettings,
}: DashboardClientContentProps) {
  const { t } = useTranslation(); 
  const { toast } = useToast();
  const reportContentRef = React.useRef<HTMLDivElement>(null);
  
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfDay(subDays(new Date(), 6)), 
    to: endOfDay(new Date()),
  });

  const [filteredHistoricalData, setFilteredHistoricalData] = React.useState<HistoricalDataPoint[]>([]);
  const [html2pdfInstance, setHtml2pdfInstance] = useState<any>(null);
  const [isPdfLibReady, setIsPdfLibReady] = useState(false);

  useEffect(() => {
    // Initial load logic, previously in onInitialLoad
    if (initialCustomAlertSettings && MOCK_AIR_QUALITY_DATA && t && toast) {
      checkAlertsAndNotify(lng, initialCustomAlertSettings, MOCK_AIR_QUALITY_DATA, t, toast);
    }
    if(aiAnalysisForReport && toast && t) {
        toast({ title: t('aiAnalysisUpdatedTitle'), description: t('aiAnalysisUpdatedDesc') });
    }
  }, [initialCustomAlertSettings, lng, t, toast, aiAnalysisForReport]);


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

  useEffect(() => {
    console.log("DashboardClientContent: Attempting to load html2pdf.js");
    import('html2pdf.js')
      .then(module => {
        setHtml2pdfInstance(() => module.default);
        setIsPdfLibReady(true);
        console.log("DashboardClientContent: html2pdf.js loaded successfully and stored in state.");
      })
      .catch(err => {
        console.error("DashboardClientContent: Failed to load html2pdf.js", err);
        if (typeof setPrintHandler === 'function') {
          setPrintHandler(null); 
        }
      });
  }, [setPrintHandler]);

  useEffect(() => {
    console.log(
      "DashboardClientContent: Print handler setup effect. isPdfLibReady:", isPdfLibReady,
      "html2pdfInstance available:", !!html2pdfInstance,
      "reportContentRef.current available:", !!reportContentRef.current,
      "typeof setPrintHandler:", typeof setPrintHandler
    );

    if (typeof setPrintHandler === 'function') {
      if (isPdfLibReady && html2pdfInstance && reportContentRef.current) {
        console.log("DashboardClientContent: Conditions met - html2pdf.js is loaded AND reportContentRef IS available.");
        
        const handleGeneratePdf = async () => {
          console.log("DashboardClientContent: Attempting to generate PDF with html2pdf.js. reportContentRef exists:", !!reportContentRef.current);
              
          if (reportContentRef.current && html2pdfInstance) {
            const element = reportContentRef.current;
            const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
            const filename = `BreatheEasy_Report_${timestamp}.pdf`;
            
            console.log("DashboardClientContent: Element to print:", element);

            const opt = {
              margin:       0.5, 
              filename:     filename,
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2, useCORS: true, logging: false, letterRendering: true, width: element.scrollWidth, height: element.scrollHeight },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
              pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
            };

            try {
              await html2pdfInstance().from(element).set(opt).save();
              console.log("DashboardClientContent: PDF generation and download initiated.");
            } catch (pdfError) {
              console.error("DashboardClientContent: html2pdf.js error:", pdfError);
              toast({ variant: "destructive", title: t('pdfGenerationErrorTitle'), description: t('pdfGenerationErrorGeneric') });
            }
          } else {
            console.error('DashboardClientContent: Printable report content ref or html2pdfInstance is not available at time of PDF generation.');
            toast({ variant: "destructive", title: t('pdfGenerationErrorTitle'), description: t('reportContentMissingError') });
          }
        };
        
        setPrintHandler(handleGeneratePdf);
        console.log("DashboardClientContent: PDF generation handler (using html2pdf.js) has been SET.");
      } else {
        console.warn("DashboardClientContent: Conditions NOT met for setting print handler. isPdfLibReady:", isPdfLibReady, "hasRef:", !!reportContentRef.current, "hasInstance:",!!html2pdfInstance, ". Print handler not set (or reset).");
        setPrintHandler(null); 
      }

      return () => {
        if (typeof setPrintHandler === 'function') {
          setPrintHandler(null);
          console.log("DashboardClientContent: PDF generation handler has been UNSET (cleanup for print handler setup effect).");
        }
      };
    }
  }, [isPdfLibReady, html2pdfInstance, setPrintHandler, t, lng, toast]); 

  const selectedDateRangeString = date?.from && date?.to 
    ? `${format(date.from, "LLL dd, y")} - ${format(date.to, "LLL dd, y")}`
    : date?.from 
    ? format(date.from, "LLL dd, y")
    : t('noDateRangeSelected');


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
      
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '8.5in', backgroundColor: 'white', color: '#333' }} id="pdf-render-source-container">
        <PrintableReport 
            ref={reportContentRef} 
            airQualityData={MOCK_AIR_QUALITY_DATA} 
            aiAnalysis={aiAnalysisForReport} 
            lng={lng}
            selectedDateRange={selectedDateRangeString} 
        />
      </div>
    </div>
  );
}

